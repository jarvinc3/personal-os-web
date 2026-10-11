"use client"

import { ApiError, apiGet } from "@/src/config/api-client"
import type { FinanceDashboardRange } from "@/src/modules/finance/shared/lib/dashboard-period"
import { FINANCE_ANALYTICS_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import type { FinanceAnalyticsSummary } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

function withRange(path: string, range: FinanceDashboardRange): string {
  const params = new URLSearchParams({
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  })
  return `${path}?${params.toString()}`
}

export function useAnalyticsSummary(
  enabled: boolean,
  range: FinanceDashboardRange
) {
  return useQuery({
    queryKey: [...FINANCE_ANALYTICS_QUERY_KEY, "summary", range],
    queryFn: () =>
      apiGet<FinanceAnalyticsSummary>(
        withRange(API_ENDPOINTS.FINANCE.ANALYTICS_SUMMARY, range)
      ),
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 400) {
        return false
      }
      return failureCount < 2
    },
  })
}
