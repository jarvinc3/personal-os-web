"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type { CreateBudgetBody } from "@/src/modules/finance/lib/budget-payloads"
import {
  buildBudgetsSearchParams,
  type FinanceBudgetsQuery,
} from "@/src/modules/finance/lib/budgets-query"
import {
  FINANCE_ANALYTICS_QUERY_KEY,
  FINANCE_BUDGETS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/types/api"
import type { FinanceBudget } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidateBudgets(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: FINANCE_BUDGETS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: FINANCE_ANALYTICS_QUERY_KEY })
}

export function useBudgets(enabled: boolean, query: FinanceBudgetsQuery) {
  const search = buildBudgetsSearchParams(query)
  return useQuery({
    queryKey: [...FINANCE_BUDGETS_QUERY_KEY, "list", query],
    queryFn: () =>
      apiGet<FinancePaginated<FinanceBudget>>(
        `${API_ENDPOINTS.FINANCE.BUDGETS}?${search}`,
      ),
    enabled,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBudgetBody) =>
      apiPost<FinanceBudget>(API_ENDPOINTS.FINANCE.BUDGETS, body),
    onSuccess: () => invalidateBudgets(queryClient),
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateBudgetBody }) =>
      apiPatch<FinanceBudget>(API_ENDPOINTS.FINANCE.BUDGET(id), body),
    onSuccess: () => invalidateBudgets(queryClient),
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.BUDGET(id)),
    onSuccess: () => invalidateBudgets(queryClient),
  })
}
