"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { loansQuery } from "@/src/modules/finance/lib/finance-query-options"
import type { CreateLoanBody } from "@/src/modules/finance/lib/planning-payloads"
import { FINANCE_LOANS_QUERY_KEY } from "@/src/modules/finance/types/api"
import type { FinanceLoan } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invalidateFinanceBalanceSheet } from "@/src/modules/finance/hooks/use-balance-sheet"

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: FINANCE_LOANS_QUERY_KEY })
  invalidateFinanceBalanceSheet(queryClient)
}

export function useLoans(enabled: boolean) {
  return useQuery({
    ...loansQuery(),
    enabled,
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLoanBody) =>
      apiPost<FinanceLoan>(API_ENDPOINTS.FINANCE.LOANS, body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useUpdateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateLoanBody }) =>
      apiPatch<FinanceLoan>(API_ENDPOINTS.FINANCE.LOAN(id), body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useArchiveLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<FinanceLoan>(API_ENDPOINTS.FINANCE.LOAN(id), { isActive: false }),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.LOAN(id)),
    onSuccess: () => invalidate(queryClient),
  })
}
