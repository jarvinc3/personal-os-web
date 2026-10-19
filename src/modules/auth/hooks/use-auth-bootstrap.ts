"use client"

import { queryClient } from "@/src/config/query-client"
import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { resolveAuthStateChangeDecision } from "@/src/modules/auth/lib/auth-state-change"
import { establishAuthenticatedSession } from "@/src/modules/auth/lib/establish-auth-session"
import { PROFILE_QUERY_KEY } from "@/src/modules/auth/lib/hydrate-auth-user"
import { mapSupabaseSession } from "@/src/modules/auth/services/supabase-auth.service"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { authEvents } from "@/src/shared/events/auth-events"
import { useAppStore } from "@/src/shared/store/app-store"
import type { Session } from "@supabase/supabase-js"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

const AUTH_CALLBACK_DEFER_MS = 0
const BOOTSTRAP_FALLBACK_MS = 3_000

async function resolveSessionBootstrap(
  session: Session | null,
  onLoginRoute: boolean
): Promise<void> {
  if (!session) {
    useAppStore.getState().clearAuthState()
    return
  }

  // `/login` is only reached when the proxy found no claims, so a stored
  // session there is stale and hydrating it can block the form on `/users/me`.
  if (onLoginRoute) {
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

      const task = resolveSessionBootstrap(
        session,
        window.location.pathname === APP_ROUTES.auth.login
      ).finally(() => {
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

      const decision = resolveAuthStateChangeDecision({
        event,
        session,
        currentUser: useAppStore.getState().user,
      })

      switch (decision.kind) {
        case "clear-session":
          clearAuthState()
          void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
          markBootstrapped()
          return

        case "initial-session":
          scheduleInitialBootstrap(decision.session)
          return

        case "keep-session":
          useAppStore.getState().setAuthState({
            session: mapSupabaseSession(decision.session),
            user: decision.user,
          })
          return

        case "establish-session":
          scheduleDeferred(async () => {
            try {
              await runBootstrap(decision.session)
            } catch {
              if (mounted) {
                clearAuthState()
              }
            }
          })
          return

        case "clear":
          clearAuthState()
          void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
          return
      }
    })

    return () => {
      mounted = false
      clearTimeout(fallbackTimer)
      unsubscribeUnauthorized()
      subscription.unsubscribe()
    }
  }, [clearAuthState, setBootstrapped])
}
