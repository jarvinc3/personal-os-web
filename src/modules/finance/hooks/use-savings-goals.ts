"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { asFinanceArray } from "@/src/modules/finance/lib/planning-lists"
import type { CreateSavingsGoalBody } from "@/src/modules/finance/lib/planning-payloads"
import { FINANCE_SAVINGS_GOALS_QUERY_KEY } from "@/src/modules/finance/types/api"
import type { FinanceSavingsGoal } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_SAVINGS_GOALS_QUERY_KEY,
  })
}

export function useSavingsGoals(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_SAVINGS_GOALS_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceSavingsGoal>(
        await apiGet(API_ENDPOINTS.FINANCE.SAVINGS_GOALS),
      ),
    enabled,
  })
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSavingsGoalBody) =>
      apiPost<FinanceSavingsGoal>(API_ENDPOINTS.FINANCE.SAVINGS_GOALS, body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateSavingsGoalBody }) =>
      apiPatch<FinanceSavingsGoal>(
        API_ENDPOINTS.FINANCE.SAVINGS_GOAL(id),
        body,
      ),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ENDPOINTS.FINANCE.SAVINGS_GOAL(id)),
    onSuccess: () => invalidate(queryClient),
  })
}
