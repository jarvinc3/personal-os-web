"use client"

import { apiGet, apiPatch } from "@/src/config/api-client"
import type { AiConsent } from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const AI_CONSENT_QUERY_KEY = ["intelligence", "consent"] as const

export function useAiConsent() {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const consentQuery = useQuery({
    queryKey: AI_CONSENT_QUERY_KEY,
    queryFn: ({ signal }) =>
      apiGet<AiConsent>(API_ENDPOINTS.INTELLIGENCE.CONSENT, signal),
    enabled: Boolean(session),
  })
  const consentMutation = useMutation({
    mutationFn: (contributeToGlobalKnowledge: boolean) =>
      apiPatch<AiConsent>(API_ENDPOINTS.INTELLIGENCE.CONSENT, {
        contributeToGlobalKnowledge,
      }),
    onSuccess: (consent) => {
      queryClient.setQueryData(AI_CONSENT_QUERY_KEY, consent)
      appToast.success({
        text1: "Consentimiento actualizado",
        text2: consent.contributeToGlobalKnowledge
          ? "Tu evidencia contribuirá en el próximo rebuild del conocimiento."
          : "Tu evidencia ya no contribuye al conocimiento global.",
      })
    },
    onError: (error) => {
      appToast.error({ text1: "No se pudo guardar", text2: error.message })
    },
  })
  return { consentQuery, consentMutation }
}
