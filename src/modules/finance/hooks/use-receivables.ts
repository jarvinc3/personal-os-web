"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { invalidateFinancePositions } from "@/src/modules/finance/hooks/use-balance-sheet"
import {
  receivablePaymentsQuery,
  receivablesQuery,
} from "@/src/modules/finance/lib/finance-query-options"
import type {
  CreateReceivableBody,
  RecordReceivablePaymentBody,
  UpdateReceivableBody,
} from "@/src/modules/finance/lib/planning-payloads"
import {
  FINANCE_RECEIVABLE_PAYMENTS_QUERY_KEY,
  FINANCE_RECEIVABLES_QUERY_KEY,
} from "@/src/modules/finance/types/api"
import type {
  FinanceReceivable,
  FinanceReceivablePayment,
} from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_RECEIVABLES_QUERY_KEY,
  })
}

export function useReceivables(enabled: boolean) {
  return useQuery({
    ...receivablesQuery(),
    enabled,
  })
}

export function useCreateReceivable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReceivableBody) =>
      apiPost<FinanceReceivable>(API_ENDPOINTS.FINANCE.RECEIVABLES, body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useUpdateReceivable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: UpdateReceivableBody | { status: "CANCELLED" }
    }) =>
      apiPatch<FinanceReceivable>(API_ENDPOINTS.FINANCE.RECEIVABLE(id), body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteReceivable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.RECEIVABLE(id)),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useReceivablePayments(
  enabled: boolean,
  receivableId: string | null
) {
  return useQuery({
    ...receivablePaymentsQuery(receivableId ?? ""),
    enabled: enabled && Boolean(receivableId),
  })
}

export function useRecordReceivablePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      receivableId,
      body,
    }: {
      receivableId: string
      body: RecordReceivablePaymentBody
    }) =>
      apiPost<FinanceReceivablePayment>(
        API_ENDPOINTS.FINANCE.RECEIVABLE_PAYMENTS(receivableId),
        body
      ),
    onSuccess: () => {
      invalidate(queryClient)
      void queryClient.invalidateQueries({
        queryKey: FINANCE_RECEIVABLE_PAYMENTS_QUERY_KEY,
      })
      // The collection is real income on an account.
      invalidateFinancePositions(queryClient)
    },
  })
}
