"use client"

import { apiDelete, apiGet, apiPost } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import { invalidateFinancePositions } from "@/src/modules/finance/shared/hooks/use-balance-sheet"
import {
  FINANCE_BANK_CHARGES_QUERY_KEY,
  FINANCE_RECONCILIATIONS_QUERY_KEY,
  FINANCE_RECONCILIATION_STATUS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceBankCharges,
  FinanceReconciliation,
  FinanceReconciliationPreview,
  FinanceReconciliationStatus,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const FINANCE_RECONCILIATION_PAGE_SIZE = 20

export type ReconciliationTarget =
  { accountId: string; cardId?: never } | { cardId: string; accountId?: never }

export type ReconciliationPreviewBody = ReconciliationTarget & {
  currency?: string
  asOfDate: string
  realBalance: number
}

export type ReconciliationCreateBody = ReconciliationPreviewBody & {
  adjustments?: Array<{ kind: string; amount: number }>
  note?: string
}

function invalidateReconciliations(
  queryClient: ReturnType<typeof useQueryClient>
): void {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_RECONCILIATIONS_QUERY_KEY,
  })
  void queryClient.invalidateQueries({
    queryKey: FINANCE_RECONCILIATION_STATUS_QUERY_KEY,
  })
  void queryClient.invalidateQueries({
    queryKey: FINANCE_BANK_CHARGES_QUERY_KEY,
  })
  invalidateFinancePositions(queryClient)
}

export function useReconciliations(
  enabled: boolean,
  target: ReconciliationTarget
) {
  return useInfiniteFinanceList<FinancePaginated<FinanceReconciliation>>({
    queryKey: [
      ...FINANCE_RECONCILIATIONS_QUERY_KEY,
      target.accountId ? "account" : "card",
      target.accountId ?? target.cardId,
    ],
    endpoint: API_ENDPOINTS.FINANCE.RECONCILIATIONS,
    params: {
      limit: FINANCE_RECONCILIATION_PAGE_SIZE,
      ...(target.accountId
        ? { accountId: target.accountId }
        : { cardId: target.cardId }),
    },
    enabled,
  })
}

export function useReconciliationStatus(enabled: boolean, month: string) {
  return useQuery({
    queryKey: [...FINANCE_RECONCILIATION_STATUS_QUERY_KEY, month],
    queryFn: () =>
      apiGet<FinanceReconciliationStatus>(
        `${API_ENDPOINTS.FINANCE.RECONCILIATION_STATUS}?month=${month}`
      ),
    enabled: enabled && Boolean(month),
  })
}

export function useBankCharges(
  enabled: boolean,
  range: { from: string; to: string }
) {
  return useQuery({
    queryKey: [...FINANCE_BANK_CHARGES_QUERY_KEY, range],
    queryFn: () => {
      const params = new URLSearchParams({ from: range.from, to: range.to })
      return apiGet<FinanceBankCharges>(
        `${API_ENDPOINTS.FINANCE.ANALYTICS_BANK_CHARGES}?${params.toString()}`
      )
    },
    enabled,
  })
}

export function useReconciliationPreview(
  enabled: boolean,
  body: ReconciliationPreviewBody | null
) {
  return useQuery({
    queryKey: [...FINANCE_RECONCILIATIONS_QUERY_KEY, "preview", body],
    queryFn: () =>
      apiPost<FinanceReconciliationPreview>(
        API_ENDPOINTS.FINANCE.RECONCILIATION_PREVIEW,
        body
      ),
    enabled: enabled && body !== null,
    staleTime: Infinity,
  })
}

export function useCreateReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ReconciliationCreateBody) =>
      apiPost<FinanceReconciliation>(
        API_ENDPOINTS.FINANCE.RECONCILIATIONS,
        body
      ),
    onSuccess: () => invalidateReconciliations(queryClient),
  })
}

export function useDeleteReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<{ success: boolean; undoId: string }>(
        API_ENDPOINTS.FINANCE.RECONCILIATION(id)
      ),
    onSuccess: () => invalidateReconciliations(queryClient),
  })
}

export function useRestoreReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.RECONCILIATION_RESTORE(id),
        {}
      ),
    onSuccess: () => invalidateReconciliations(queryClient),
  })
}
