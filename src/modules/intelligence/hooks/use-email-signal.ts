"use client"

import { ApiError, apiGet } from "@/src/config/api-client"
import { emailSignalId } from "@/src/modules/intelligence/signals"
import type { EmailSignal } from "@/src/modules/intelligence/types/signal.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQuery } from "@tanstack/react-query"

export function useEmailSignal(messageId: string | null) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: ["intelligence", "signal", messageId],
    queryFn: async ({ signal }) => {
      try {
        return await apiGet<EmailSignal>(
          API_ENDPOINTS.INTELLIGENCE.SIGNAL(emailSignalId(messageId!)),
          signal
        )
      } catch (error) {
        // El back responde 404 cuando el correo no tiene señal; no es un fallo.
        if (error instanceof ApiError && error.status === 404) {
          return null
        }
        throw error
      }
    },
    enabled: Boolean(session && messageId),
    retry: false,
  })
}
