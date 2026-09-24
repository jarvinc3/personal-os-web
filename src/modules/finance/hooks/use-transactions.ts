"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CreateTransactionBody,
  CreateTransferBody,
} from "@/src/modules/finance/lib/ledger-payloads"
import {
  buildTransactionsSearchParams,
  fetchAllTransactionPages,
  FINANCE_TIMELINE_PAGE_SIZE,
  FINANCE_TX_PAGE_SIZE,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/lib/transactions-query"
import { intersectIsoDateRange } from "@/src/modules/finance/lib/month-window"
import { invalidateFinancePositions } from "@/src/modules/finance/hooks/use-balance-sheet"
import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/types/api"
import type {
  FinanceTransaction,
  FinanceTransferResult,
} from "@/src/modules/finance/types/entities"
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
  query: FinanceTransactionsQuery,
) {
  const search = buildTransactionsSearchParams(query)
  return useQuery({
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "list", query],
    queryFn: () =>
      apiGet<FinancePaginated<FinanceTransaction>>(
        `${API_ENDPOINTS.FINANCE.TRANSACTIONS}?${search}`,
      ),
    enabled,
  })
}

export type TimelineTransactionFilters = Omit<
  FinanceTransactionsQuery,
  "page" | "limit"
>

export function useTimelineTransactions(
  enabled: boolean,
  years: number[],
  filters: TimelineTransactionFilters,
) {
  const queries = useQueries({
    queries: years.map((year) => {
      const intersection = intersectIsoDateRange(
        `${year}-01-01`,
        `${year}-12-31`,
        filters.dateFrom,
        filters.dateTo,
      )
      return {
        queryKey: [
          ...FINANCE_TRANSACTIONS_QUERY_KEY,
          "timeline",
          year,
          filters,
        ],
        enabled: enabled && intersection !== null,
        queryFn: () =>
          fetchAllTransactionPages(
            {
              ...filters,
              dateFrom: intersection?.dateFrom,
              dateTo: intersection?.dateTo,
              limit: FINANCE_TIMELINE_PAGE_SIZE,
            },
            (path) => apiGet(path),
          ),
      }
    }),
  })

  const items = useMemo(() => {
    const byId = new Map<string, FinanceTransaction>()
    for (const query of queries) {
      for (const item of query.data ?? []) {
        byId.set(item.id, item)
      }
    }
    return [...byId.values()]
  }, [queries])

  return {
    items,
    isPending: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
    error: queries.find((query) => query.error)?.error ?? null,
  }
}

export function useTransactionSearch(enabled: boolean, search: string) {
  const trimmed = search.trim()
  return useTransactions(enabled && trimmed.length > 0, {
    page: 1,
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
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: CreateTransactionBody
    }) =>
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

export function useConfirmTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceTransaction>(API_ENDPOINTS.FINANCE.TRANSACTION_CONFIRM(id)),
    onSuccess: () => invalidateLedger(queryClient),
  })
}

export function useReverseTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceTransaction>(API_ENDPOINTS.FINANCE.TRANSACTION_REVERSE(id)),
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
