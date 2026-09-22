"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { receivablesQuery } from "@/src/modules/finance/lib/finance-query-options"
import type { CreateReceivableBody } from "@/src/modules/finance/lib/planning-payloads"
import { FINANCE_RECEIVABLES_QUERY_KEY } from "@/src/modules/finance/types/api"
import type { FinanceReceivable } from "@/src/modules/finance/types/entities"
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
      body: CreateReceivableBody | { status: "PAID" | "CANCELLED" }
    }) =>
      apiPatch<FinanceReceivable>(API_ENDPOINTS.FINANCE.RECEIVABLE(id), body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteReceivable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ENDPOINTS.FINANCE.RECEIVABLE(id)),
    onSuccess: () => invalidate(queryClient),
  })
}
