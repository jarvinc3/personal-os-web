"use client"

import { apiGet } from "@/src/config/api-client"
import type { EmailUsageSummary } from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQuery } from "@tanstack/react-query"

export const EMAIL_USAGE_QUERY_KEY = ["intelligence", "email-usage"] as const

export function useEmailUsage(days: number) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: [...EMAIL_USAGE_QUERY_KEY, days],
    queryFn: ({ signal }) =>
      apiGet<EmailUsageSummary>(
        `${API_ENDPOINTS.INTELLIGENCE.EMAIL_USAGE}?days=${days}`,
        signal
      ),
    enabled: Boolean(session),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}
