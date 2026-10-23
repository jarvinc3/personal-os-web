"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type { CreateBudgetBody } from "@/src/modules/finance/shared/lib/budget-payloads"
import { budgetFromListPages } from "@/src/modules/finance/shared/lib/budget-cache"
import { type FinanceBudgetsQuery } from "@/src/modules/finance/shared/lib/budgets-query"
import { FINANCE_LIST_PAGE_SIZE } from "@/src/modules/finance/shared/lib/finance-query-options"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  FINANCE_ANALYTICS_QUERY_KEY,
  FINANCE_BUDGETS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceBudget,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { toUserWallClock } from "@/src/modules/finance/shared/lib/transactions-query"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query"

function invalidateBudgets(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: FINANCE_BUDGETS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: FINANCE_ANALYTICS_QUERY_KEY })
}

export function useBudgets(enabled: boolean, query: FinanceBudgetsQuery) {
  return useInfiniteFinanceList<FinancePaginated<FinanceBudget>>({
    queryKey: [...FINANCE_BUDGETS_QUERY_KEY, "infinite", query],
    endpoint: API_ENDPOINTS.FINANCE.BUDGETS,
    params: { limit: query.limit },
    enabled,
  })
}

/** Budget the list already fetched, so the detail paints before the network. */
function budgetFromQueryCache(
  queryClient: QueryClient,
  id: string | null
): FinanceBudget | undefined {
  if (!id) {
    return undefined
  }
  const cachedLists = queryClient.getQueriesData<
    InfiniteData<FinancePaginated<FinanceBudget>>
  >({ queryKey: FINANCE_BUDGETS_QUERY_KEY })
  for (const [, cached] of cachedLists) {
    if (!cached) {
      continue
    }
    const found = budgetFromListPages(cached.pages, id)
    if (found) {
      return found
    }
  }
  return undefined
}

export function useBudget(enabled: boolean, id: string | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: [...FINANCE_BUDGETS_QUERY_KEY, "detail", id],
    queryFn: () => apiGet<FinanceBudget>(API_ENDPOINTS.FINANCE.BUDGET(id!)),
    placeholderData: () => budgetFromQueryCache(queryClient, id),
    enabled: enabled && Boolean(id),
  })
}

export function useBudgetTransactions(enabled: boolean, id: string | null) {
  const timeZone = useUserTimeZone()
  return useInfiniteFinanceList<FinancePaginated<FinanceTransaction>>({
    queryKey: [
      ...FINANCE_BUDGETS_QUERY_KEY,
      "transactions",
      id ?? "",
      timeZone,
    ],
    endpoint: API_ENDPOINTS.FINANCE.BUDGET_TRANSACTIONS(id ?? ""),
    params: { limit: FINANCE_LIST_PAGE_SIZE },
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => toUserWallClock(item, timeZone)),
      })),
    }),
    enabled: enabled && Boolean(id),
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

export function useRestoreBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(API_ENDPOINTS.FINANCE.BUDGET_RESTORE(id)),
    onSuccess: () => invalidateBudgets(queryClient),
  })
}
