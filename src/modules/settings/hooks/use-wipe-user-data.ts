"use client"

import { apiPost } from "@/src/config/api-client"
import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { clearPrefs } from "@/src/modules/keep-awake/lib/prefs"
import { AuthServiceError } from "@/src/modules/auth/services/supabase-auth.service"
import {
  WIPE_LAYERS,
  type WipeLayerId,
} from "@/src/modules/settings/lib/wipe-layers"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export type WipeUserDataResult = {
  success: true
  requestedLayers: WipeLayerId[]
  appliedLayers: WipeLayerId[]
  counts: Record<string, number>
}

export type WipeUserDataPayload = {
  email: string
  password: string
  layers: WipeLayerId[]
}

async function reauthenticate(email: string, password: string): Promise<void> {
  const { error: reauthError } =
    await getSupabaseBrowserClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

  if (reauthError) {
    throw new AuthServiceError(
      reauthError.message || "La contraseña no es correcta.",
      reauthError.code,
      reauthError
    )
  }
}

async function wipeData(layers: WipeLayerId[]): Promise<void> {
  await apiPost<WipeUserDataResult>(API_ENDPOINTS.USERS.WIPE_DATA, { layers })
}

function clearLocalState(appliedLayers: readonly WipeLayerId[]): void {
  if (appliedLayers.includes(WIPE_LAYERS.SETTINGS_DEFAULTS)) {
    clearPrefs()
  }
}

export function useWipeUserData() {
  const queryClient = useQueryClient()

  const finishWipe = (appliedLayers: readonly WipeLayerId[]): void => {
    clearLocalState(appliedLayers)
    void queryClient.invalidateQueries()
    appToast.success({
      text1: "Datos vaciados",
      text2: "Las capas seleccionadas quedaron vacías.",
    })
  }

  const mutation = useMutation({
    mutationFn: async (payload: WipeUserDataPayload) => {
      await reauthenticate(payload.email, payload.password)
      await wipeData(payload.layers)
    },
    onSuccess: (_wipeResponse, variables) => finishWipe(variables.layers),
    onError: (error) => {
      appToast.error({
        text1: "No se pudieron vaciar los datos",
        text2:
          error instanceof AuthServiceError ? error.message : error.message,
      })
    },
  })

  const wipeAfterReauth = useMutation({
    mutationFn: (layers: WipeLayerId[]) => wipeData(layers),
    onSuccess: (_wipeResponse, layers) => finishWipe(layers),
    onError: (error) => {
      appToast.error({
        text1: "No se pudieron vaciar los datos",
        text2: error.message,
      })
    },
  })

  return { ...mutation, wipeAfterReauth }
}
