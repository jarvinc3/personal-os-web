"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CreateTransactionBody,
  CreateTransferBody,
} from "@/src/modules/finance/lib/ledger-payloads"
import {
  buildTransactionsSearchParams,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/lib/transactions-query"
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
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

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
