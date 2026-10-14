"use client"

import { apiDelete, apiPatch, apiPost } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "./use-infinite-finance-list"
import {
  FINANCE_LIST_PAGE_SIZE,
  savingsGoalsQuery,
} from "@/src/modules/finance/shared/lib/finance-query-options"
import type {
  CreateSavingsGoalBody,
  CreateSavingsGoalContributionBody,
  UpdateSavingsGoalBody,
} from "@/src/modules/finance/shared/lib/planning-payloads"
import {
  FINANCE_SAVINGS_GOAL_CONTRIBUTIONS_QUERY_KEY,
  FINANCE_SAVINGS_GOALS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceSavingsGoal,
  FinanceSavingsGoalContribution,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_SAVINGS_GOALS_QUERY_KEY,
  })
}

export function useSavingsGoals(enabled: boolean) {
  return useQuery({
    ...savingsGoalsQuery(),
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
    mutationFn: ({ id, body }: { id: string; body: UpdateSavingsGoalBody }) =>
      apiPatch<FinanceSavingsGoal>(
        API_ENDPOINTS.FINANCE.SAVINGS_GOAL(id),
        body
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

export function useRestoreSavingsGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.SAVINGS_GOAL_RESTORE(id)
      ),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useSavingsGoalContributions(
  enabled: boolean,
  goalId: string | null
) {
  return useInfiniteFinanceList<
    FinancePaginated<FinanceSavingsGoalContribution>
  >({
    queryKey: [...FINANCE_SAVINGS_GOAL_CONTRIBUTIONS_QUERY_KEY, goalId ?? ""],
    endpoint: API_ENDPOINTS.FINANCE.SAVINGS_GOAL_CONTRIBUTIONS(goalId ?? ""),
    params: { limit: FINANCE_LIST_PAGE_SIZE },
    enabled: enabled && Boolean(goalId),
  })
}

/** A contribution moves the goal balance, so both lists are refreshed together. */
function invalidateGoalAndContributions(
  queryClient: ReturnType<typeof useQueryClient>
) {
  invalidate(queryClient)
  void queryClient.invalidateQueries({
    queryKey: FINANCE_SAVINGS_GOAL_CONTRIBUTIONS_QUERY_KEY,
  })
}

export function useCreateSavingsGoalContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      goalId,
      body,
    }: {
      goalId: string
      body: CreateSavingsGoalContributionBody
    }) =>
      apiPost<FinanceSavingsGoalContribution>(
        API_ENDPOINTS.FINANCE.SAVINGS_GOAL_CONTRIBUTIONS(goalId),
        body
      ),
    onSuccess: () => invalidateGoalAndContributions(queryClient),
  })
}

export function useDeleteSavingsGoalContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      goalId,
      contributionId,
    }: {
      goalId: string
      contributionId: string
    }) =>
      apiDelete(
        API_ENDPOINTS.FINANCE.SAVINGS_GOAL_CONTRIBUTION(goalId, contributionId)
      ),
    onSuccess: () => invalidateGoalAndContributions(queryClient),
  })
}
