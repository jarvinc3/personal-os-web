"use client"

import { queryClient } from "@/src/config/query-client"
import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { establishAuthenticatedSession } from "@/src/modules/auth/lib/establish-auth-session"
import { PROFILE_QUERY_KEY } from "@/src/modules/auth/lib/hydrate-auth-user"
import { mapSupabaseSession } from "@/src/modules/auth/services/supabase-auth.service"
import { authEvents } from "@/src/shared/events/auth-events"
import { useAppStore } from "@/src/shared/store/app-store"
import type { Session } from "@supabase/supabase-js"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

const AUTH_CALLBACK_DEFER_MS = 0
const BOOTSTRAP_FALLBACK_MS = 3_000

async function resolveSessionBootstrap(session: Session | null): Promise<void> {
  if (!session) {
    useAppStore.getState().clearAuthState()
    return
  }

  await establishAuthenticatedSession(session)
}

export function useAuthBootstrap() {
  const setBootstrapped = useAppStore((state) => state.setBootstrapped)
  const clearAuthState = useAppStore((state) => state.clearAuthState)
  const bootstrapInFlightRef = useRef<Promise<void> | null>(null)
  const bootstrappedRef = useRef(false)
  const initialSessionScheduledRef = useRef(false)

  useEffect(() => {
    let mounted = true
    const supabase = getSupabaseBrowserClient()

    function markBootstrapped() {
      if (!mounted || bootstrappedRef.current) {
        return
      }
      bootstrappedRef.current = true
      setBootstrapped(true)
    }

    async function runBootstrap(session: Session | null) {
      if (bootstrapInFlightRef.current) {
        await bootstrapInFlightRef.current
        return
      }

      const task = resolveSessionBootstrap(session).finally(() => {
        bootstrapInFlightRef.current = null
      })
      bootstrapInFlightRef.current = task
      await task
    }

    function scheduleDeferred(task: () => Promise<void>) {
      setTimeout(() => {
        if (!mounted) {
          return
        }
        void task().finally(() => {
          markBootstrapped()
        })
      }, AUTH_CALLBACK_DEFER_MS)
    }

    function scheduleInitialBootstrap(session: Session | null) {
      if (initialSessionScheduledRef.current) {
        return
      }
      initialSessionScheduledRef.current = true

      scheduleDeferred(async () => {
        try {
          await runBootstrap(session)
        } catch {
          if (mounted) {
            clearAuthState()
          }
        }
      })
    }

    const fallbackTimer = setTimeout(() => {
      if (
        !mounted ||
        bootstrappedRef.current ||
        initialSessionScheduledRef.current
      ) {
        return
      }

      void (async () => {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            throw error
          }

          await runBootstrap(session)
        } catch {
          if (mounted) {
            clearAuthState()
          }
        } finally {
          markBootstrapped()
        }
      })()
    }, BOOTSTRAP_FALLBACK_MS)

    const unsubscribeUnauthorized = authEvents.onUnauthorized(() => {
      if (!mounted) {
        return
      }
      clearAuthState()
      void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
      void supabase.auth.signOut()
      toast.info("Sesión expirada", {
        description: "Inicia sesión de nuevo para continuar.",
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return
      }

      if (event === "SIGNED_OUT") {
        clearAuthState()
        void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
        markBootstrapped()
        return
      }

      if (event === "INITIAL_SESSION") {
        scheduleInitialBootstrap(session)
        return
      }

      scheduleDeferred(async () => {
        if (session) {
          if (event === "TOKEN_REFRESHED") {
            const existingUser = useAppStore.getState().user
            if (existingUser?.profile) {
              useAppStore.getState().setAuthState({
                session: mapSupabaseSession(session),
                user: existingUser,
              })
              return
            }
          }

          try {
            await runBootstrap(session)
          } catch {
            if (mounted) {
              clearAuthState()
            }
          }
          return
        }

        clearAuthState()
        void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
      })
    })

    return () => {
      mounted = false
      clearTimeout(fallbackTimer)
      unsubscribeUnauthorized()
      subscription.unsubscribe()
    }
  }, [clearAuthState, setBootstrapped])
}
