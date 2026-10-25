"use client"

import {
  isProfileUnavailableFailure,
  resolveRegisterFailure,
  resolveSessionRecoveryMessage,
} from "@/src/modules/auth/lib/auth-errors"
import {
  hydrateAuthUser,
  PROFILE_QUERY_KEY,
} from "@/src/modules/auth/lib/hydrate-auth-user"
import { revokeAuthSession } from "@/src/modules/auth/lib/revoke-auth-session"
import { supabaseAuthService } from "@/src/modules/auth/services/supabase-auth.service"
import type {
  LoginPayload,
  RegisterPayload,
} from "@/src/modules/auth/types/auth.types"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { appToast } from "@/src/shared/lib/app-toast"

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const clearAuthState = useAppStore((state) => state.clearAuthState)

  const applySessionWithProfile = async (
    payload: Awaited<ReturnType<typeof supabaseAuthService.login>>
  ) => {
    try {
      const hydrated = await hydrateAuthUser(payload.user)
      useAppStore
        .getState()
        .setAuthState({ session: payload.session, user: hydrated })
      // A completed login unblocks the app even if the stored-session bootstrap
      // is still waiting on Supabase.
      useAppStore.getState().setBootstrapped(true)
      queryClient.setQueryData(PROFILE_QUERY_KEY, hydrated.profile)
      return hydrated
    } catch (error) {
      await revokeAuthSession({
        message: resolveSessionRecoveryMessage(error),
      })
      throw error
    }
  }

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => supabaseAuthService.login(payload),
    onSuccess: async (payload) => {
      await applySessionWithProfile(payload)
      appToast.success({
        text1: "Sesión iniciada",
        text2: "Bienvenido de nuevo",
      })
      router.push(APP_ROUTES.app.home)
    },
    onError: (error) => {
      if (isProfileUnavailableFailure(error)) {
        return
      }
      appToast.error({
        text1: "No se pudo iniciar sesión",
        text2: error.message,
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) =>
      supabaseAuthService.register(payload),
    onSuccess: async (payload) => {
      await applySessionWithProfile(payload)
      router.push(APP_ROUTES.app.home)
    },
    onError: (error, variables) => {
      const action = resolveRegisterFailure(error, variables.email)
      if (action.kind === "silent") {
        return
      }
      if (action.kind === "verify-email") {
        router.push(action.href)
        return
      }

      appToast.error({
        text1: "No se pudo crear la cuenta",
        text2: error.message,
      })
    },
  })

  const loginWithGoogleMutation = useMutation({
    mutationFn: (options?: { next?: string }) =>
      supabaseAuthService.loginWithGoogle?.(options) ?? Promise.resolve(),
    onError: (error) => {
      appToast.error({
        text1: "No se pudo iniciar el flujo con Google",
        text2: error.message,
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await deactivatePushTokenIfPresent()
      await supabaseAuthService.logout()
    },
    onSuccess: async () => {
      clearAuthState()
      appToast.success({ text1: "Sesión cerrada" })
      await queryClient.clear()
      router.push(APP_ROUTES.auth.login)
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo cerrar sesión",
        text2: error.message,
      })
    },
  })

  return {
    loginMutation,
    registerMutation,
    loginWithGoogleMutation,
    logoutMutation,
  }
}
