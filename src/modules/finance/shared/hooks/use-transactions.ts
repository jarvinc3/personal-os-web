"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CreateCardPaymentBody,
  CreateTransactionBody,
  CreateTransferBody,
  UpdateTransactionBody,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  buildTransactionsSearchParams,
  fetchAllTransactionPages,
  FINANCE_TIMELINE_PAGE_SIZE,
  FINANCE_TIMELINE_STALE_TIME_MS,
  FINANCE_TX_PAGE_SIZE,
  mergeTransactionsById,
  timelineMonthQuery,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/shared/lib/transactions-query"
import { intersectIsoDateRange } from "@/src/modules/finance/shared/lib/month-window"
import { invalidateFinancePositions } from "./use-balance-sheet"
import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceTransaction,
  FinanceTransferResult,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo } from "react"

function invalidateLedger(queryClient: ReturnType<typeof useQueryClient>) {
  invalidateFinancePositions(queryClient)
}

export function useTransactions(
  enabled: boolean,
  query: FinanceTransactionsQuery
) {
  const search = buildTransactionsSearchParams(query)
  return useQuery({
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "list", query],
    queryFn: () =>
      apiGet<FinancePaginated<FinanceTransaction>>(
        `${API_ENDPOINTS.FINANCE.TRANSACTIONS}?${search}`
      ),
    enabled,
  })
}

export type TimelineTransactionFilters = Omit<
  FinanceTransactionsQuery,
  "cursor" | "limit"
>

export function useTimelineTransactions(
  enabled: boolean,
  years: number[],
  filters: TimelineTransactionFilters,
  currentMonthKey: string
) {
  const monthQuery = useQuery({
    ...timelineMonthQuery(currentMonthKey, (path) => apiGet(path)),
    enabled,
  })
  const yearQueries = useQueries({
    queries: years.map((year) => {
      const intersection = intersectIsoDateRange(
        `${year}-01-01`,
        `${year}-12-31`,
        filters.dateFrom,
        filters.dateTo
      )
      return {
        queryKey: [
          ...FINANCE_TRANSACTIONS_QUERY_KEY,
          "timeline",
          year,
          filters,
        ],
        staleTime: FINANCE_TIMELINE_STALE_TIME_MS,
        enabled: enabled && intersection !== null,
        queryFn: () =>
          fetchAllTransactionPages(
            {
              ...filters,
              dateFrom: intersection?.dateFrom,
              dateTo: intersection?.dateTo,
              limit: FINANCE_TIMELINE_PAGE_SIZE,
            },
            (path) => apiGet(path)
          ),
      }
    }),
  })

  const items = useMemo(
    () =>
      mergeTransactionsById([
        monthQuery.data ?? [],
        ...yearQueries.map((query) => query.data ?? []),
      ]),
    [monthQuery.data, yearQueries]
  )

  return {
    items,
    isPending: monthQuery.isLoading,
    isFetching:
      monthQuery.isFetching || yearQueries.some((query) => query.isFetching),
    isError: monthQuery.isError || yearQueries.some((query) => query.isError),
    error:
      monthQuery.error ??
      yearQueries.find((query) => query.error)?.error ??
      null,
  }
}

export function allTransactionsQueryOptions(
  filters: TimelineTransactionFilters
) {
  return {
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "all", filters],
    staleTime: FINANCE_TIMELINE_STALE_TIME_MS,
    queryFn: () =>
      fetchAllTransactionPages(
        { ...filters, limit: FINANCE_TIMELINE_PAGE_SIZE },
        (path) => apiGet(path)
      ),
  }
}

export function useAllTransactions(
  enabled: boolean,
  filters: TimelineTransactionFilters
) {
  return useQuery({ ...allTransactionsQueryOptions(filters), enabled })
}

export function useTransactionSearch(enabled: boolean, search: string) {
  const trimmed = search.trim()
  return useTransactions(enabled && trimmed.length > 0, {
    limit: FINANCE_TX_PAGE_SIZE,
    search: trimmed,
  })
}

export function useTransaction(enabled: boolean, id: string | null) {
  return useQuery({
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "detail", id],
    queryFn: () =>
      apiGet<FinanceTransaction>(API_ENDPOINTS.FINANCE.TRANSACTION(id!)),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransactionBody) =>
      apiPost<FinanceTransaction>(API_ENDPOINTS.FINANCE.TRANSACTIONS, body),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTransactionBody }) =>
      apiPatch<FinanceTransaction>(API_ENDPOINTS.FINANCE.TRANSACTION(id), body),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransferBody) =>
      apiPost<FinanceTransferResult>(API_ENDPOINTS.FINANCE.TRANSFERS, body),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useCreateCardPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCardPaymentBody) =>
      apiPost<FinanceTransferResult>(API_ENDPOINTS.FINANCE.CARD_PAYMENTS, body),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateTransferBody }) =>
      apiPatch<{ success: boolean }>(API_ENDPOINTS.FINANCE.TRANSFER(id), body),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useUnconfirmTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.TRANSFER_UNCONFIRM(id)
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useConfirmTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(API_ENDPOINTS.FINANCE.TRANSFER_CONFIRM(id)),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useReverseTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(API_ENDPOINTS.FINANCE.TRANSFER_REVERSE(id)),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useConfirmTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceTransaction>(
        API_ENDPOINTS.FINANCE.TRANSACTION_CONFIRM(id)
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useUnconfirmTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceTransaction>(
        API_ENDPOINTS.FINANCE.TRANSACTION_UNCONFIRM(id)
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useReverseTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceTransaction>(
        API_ENDPOINTS.FINANCE.TRANSACTION_REVERSE(id)
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ENDPOINTS.FINANCE.TRANSACTION(id)),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useRestoreTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.TRANSACTION_RESTORE(id)
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useMergeTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, intoId }: { id: string; intoId: string }) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.TRANSACTION_MERGE(id),
        { intoId }
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useMarkNotDuplicate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.TRANSACTION_NOT_DUPLICATE(id)
      ),
    onSuccess: () => invalidateLedger(queryClient),
  })
}
