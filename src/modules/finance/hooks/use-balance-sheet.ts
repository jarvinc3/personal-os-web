"use client"

import { ApiError, apiGet } from "@/src/config/api-client"
import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_ANALYTICS_QUERY_KEY,
  FINANCE_BALANCE_SHEET_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_TRANSACTIONS_QUERY_KEY,
} from "@/src/modules/finance/types/api"
import type { FinanceBalanceSheet } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"

export function invalidateFinanceBalanceSheet(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_BALANCE_SHEET_QUERY_KEY,
  })
}

export function invalidateFinancePositions(queryClient: QueryClient) {
  invalidateFinanceBalanceSheet(queryClient)
  void queryClient.invalidateQueries({ queryKey: FINANCE_ANALYTICS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: FINANCE_ACCOUNTS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
  void queryClient.invalidateQueries({
    queryKey: FINANCE_TRANSACTIONS_QUERY_KEY,
  })
}

export function useBalanceSheet(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_BALANCE_SHEET_QUERY_KEY,
    queryFn: () =>
      apiGet<FinanceBalanceSheet>(API_ENDPOINTS.FINANCE.BALANCE_SHEET),
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 400) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useInvalidateFinanceBalanceSheet() {
  const queryClient = useQueryClient()
  return () => invalidateFinanceBalanceSheet(queryClient)
}
