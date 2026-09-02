"use client"

import { ApiError, apiGet } from "@/src/config/api-client"
import type { FinanceDashboardRange } from "@/src/modules/finance/lib/dashboard-period"
import { FINANCE_ANALYTICS_QUERY_KEY } from "@/src/modules/finance/types/api"
import type {
  FinanceAnalyticsSummary,
  FinanceBudgetStatus,
  FinanceSpendingBucket,
  FinanceSpendingOverTime,
} from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

function withRange(
  path: string,
  range: FinanceDashboardRange,
  extra?: Record<string, string>,
): string {
  const params = new URLSearchParams({
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    ...extra,
  })
  return `${path}?${params.toString()}`
}

export function useAnalyticsSummary(enabled: boolean, range: FinanceDashboardRange) {
  return useQuery({
    queryKey: [...FINANCE_ANALYTICS_QUERY_KEY, "summary", range],
    queryFn: () =>
      apiGet<FinanceAnalyticsSummary>(
        withRange(API_ENDPOINTS.FINANCE.ANALYTICS_SUMMARY, range),
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

export function useSpendingByCategory(
  enabled: boolean,
  range: FinanceDashboardRange,
) {
  return useQuery({
    queryKey: [...FINANCE_ANALYTICS_QUERY_KEY, "spending-by-category", range],
    queryFn: () =>
      apiGet<FinanceSpendingBucket[]>(
        withRange(API_ENDPOINTS.FINANCE.ANALYTICS_SPENDING_BY_CATEGORY, range),
      ),
    enabled,
  })
}

export function useSpendingOverTime(
  enabled: boolean,
  range: FinanceDashboardRange,
) {
  return useQuery({
    queryKey: [...FINANCE_ANALYTICS_QUERY_KEY, "spending-over-time", range],
    queryFn: () =>
      apiGet<FinanceSpendingOverTime>(
        withRange(API_ENDPOINTS.FINANCE.ANALYTICS_SPENDING_OVER_TIME, range, {
          granularity: range.granularity,
        }),
      ),
    enabled,
  })
}

export function useBudgetStatus(enabled: boolean) {
  return useQuery({
    queryKey: [...FINANCE_ANALYTICS_QUERY_KEY, "budget-status"],
    queryFn: () =>
      apiGet<FinanceBudgetStatus[]>(API_ENDPOINTS.FINANCE.ANALYTICS_BUDGET_STATUS),
    enabled,
  })
}
