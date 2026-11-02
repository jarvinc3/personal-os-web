"use client"

import { ApiError, apiPost } from "@/src/config/api-client"
import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { clearPrefs } from "@/src/modules/keep-awake"
import { AuthServiceError, translateAuthError } from "@/src/modules/auth"
import { DATA_BRANCHES_QUERY_KEY } from "@/src/modules/settings/hooks/use-data-branches"
import { wipeSummary } from "@/src/modules/settings/lib/wipe-summary"
import {
  SETTINGS_DEFAULTS_BRANCH,
  type WipeUserDataResult,
} from "@/src/modules/settings/types/wipe.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

/** Duración del aviso: el cierre de la hoja no debe taparlo. */
const WIPE_TOAST_DURATION_MS = 8000

export type WipeUserDataPayload = {
  email: string
  password: string
  branches: string[]
  expectedCounts: Record<string, number>
  balanceInstitutionId?: string
  skipReauth?: boolean
  branchLabels?: Record<string, string>
}

export type WipeRequest = {
  branches: string[]
  expectedCounts: Record<string, number>
  balanceInstitutionId?: string
  /** Labels to report in the toast; they never travel to the API. */
  branchLabels?: Record<string, string>
}

export async function reauthenticateWithPassword(
  email: string,
  password: string
): Promise<void> {
  const { error: reauthError } =
    await getSupabaseBrowserClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

  if (reauthError) {
    throw new AuthServiceError(
      translateAuthError(
        { code: reauthError.code },
        "La contraseña no es correcta."
      ),
      reauthError.code,
      reauthError
    )
  }
}

function wipeData(request: WipeRequest): Promise<WipeUserDataResult> {
  return apiPost<WipeUserDataResult>(API_ENDPOINTS.USERS.WIPE_DATA, {
    branches: request.branches,
    expectedCounts: request.expectedCounts,
    ...(request.balanceInstitutionId
      ? { balanceInstitutionId: request.balanceInstitutionId }
      : {}),
  })
}

type WipeSummaryInput = {
  wipeResult: WipeUserDataResult
  branchLabels?: Record<string, string>
}

export function useWipeUserData() {
  const queryClient = useQueryClient()

  const finishWipe = ({ wipeResult, branchLabels }: WipeSummaryInput): void => {
    // El aviso se publica antes de invalidar la caché: el refresco completo de
    // las consultas no debe retrasarlo ni hacerlo pasar desapercibido.
    appToast.success({
      text1: "Datos vaciados",
      text2: wipeSummary({ wipeResult, branchLabels }),
      duration: WIPE_TOAST_DURATION_MS,
    })
    if (wipeResult.appliedBranches.includes(SETTINGS_DEFAULTS_BRANCH)) {
      clearPrefs()
    }
    void queryClient.invalidateQueries()
  }

  const handleError = (error: unknown): void => {
    if (error instanceof ApiError && error.status === 409) {
      void queryClient.invalidateQueries({ queryKey: DATA_BRANCHES_QUERY_KEY })
      appToast.warning({
        text1: "Los conteos cambiaron",
        text2:
          "La lista se actualizó. Revisa cuánto se borrará y confirma otra vez.",
      })
      return
    }
    appToast.error({
      text1: "No se pudieron vaciar los datos",
      text2:
        error instanceof Error
          ? error.message
          : "No se pudieron vaciar los datos.",
    })
  }

  const mutation = useMutation({
    mutationFn: async (payload: WipeUserDataPayload) => {
      if (!payload.skipReauth) {
        await reauthenticateWithPassword(payload.email, payload.password)
      }
      return wipeData(payload)
    },
    onSuccess: (wipeResult, variables) =>
      finishWipe({ wipeResult, branchLabels: variables.branchLabels }),
    onError: handleError,
  })

  const wipeAfterReauth = useMutation({
    mutationFn: (request: WipeRequest) => wipeData(request),
    onSuccess: (wipeResult, request) =>
      finishWipe({ wipeResult, branchLabels: request.branchLabels }),
    onError: handleError,
  })

  return { ...mutation, wipeAfterReauth }
}
