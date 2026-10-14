"use client"

import { apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  FINANCE_RECURRING_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceRecurringPattern,
  FinanceRecurringStatus,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const FINANCE_RECURRING_PAGE_SIZE = 20

export function useRecurring(
  enabled: boolean,
  status?: FinanceRecurringStatus
) {
  return useInfiniteFinanceList<FinancePaginated<FinanceRecurringPattern>>({
    queryKey: [...FINANCE_RECURRING_QUERY_KEY, "list", status ?? "all"],
    endpoint: API_ENDPOINTS.FINANCE.RECURRING,
    params: { limit: FINANCE_RECURRING_PAGE_SIZE, status },
    enabled,
  })
}

export function useUpcomingRecurring(enabled: boolean, days: number) {
  return useQuery({
    queryKey: [...FINANCE_RECURRING_QUERY_KEY, "upcoming", days],
    queryFn: () =>
      apiGet<FinanceRecurringPattern[]>(
        `${API_ENDPOINTS.FINANCE.RECURRING_UPCOMING}?days=${days}`
      ),
    enabled,
  })
}

function invalidateRecurring(
  queryClient: ReturnType<typeof useQueryClient>
): void {
  void queryClient.invalidateQueries({ queryKey: FINANCE_RECURRING_QUERY_KEY })
}

export function useCreateRecurring() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<FinanceRecurringPattern>(API_ENDPOINTS.FINANCE.RECURRING, body),
    onSuccess: () => invalidateRecurring(queryClient),
  })
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceRecurringPattern>(
        API_ENDPOINTS.FINANCE.RECURRING_PATTERN(id),
        body
      ),
    onSuccess: () => invalidateRecurring(queryClient),
  })
}
