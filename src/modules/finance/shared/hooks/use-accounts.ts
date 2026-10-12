"use client"

import { apiDelete, apiPatch, apiPost } from "@/src/config/api-client"
import type { CreateAccountBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { accountsQuery } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
} from "@/src/modules/finance/shared/types/api"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  invalidateFinanceBalanceSheet,
  invalidateFinancePositions,
} from "./use-balance-sheet"

function invalidateAccounts(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: FINANCE_ACCOUNTS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
  invalidateFinanceBalanceSheet(queryClient)
}

export function useAccounts(enabled: boolean) {
  return useQuery({
    ...accountsQuery(),
    enabled,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAccountBody) =>
      apiPost<FinanceAccount>(API_ENDPOINTS.FINANCE.ACCOUNTS, body),
    onSuccess: () => {
      invalidateAccounts(queryClient)
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceAccount>(API_ENDPOINTS.FINANCE.ACCOUNT(id), body),
    onSuccess: () => {
      invalidateAccounts(queryClient)
    },
  })
}

export function useArchiveAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<FinanceAccount>(API_ENDPOINTS.FINANCE.ACCOUNT(id), {
        isActive: false,
      }),
    onSuccess: () => {
      invalidateAccounts(queryClient)
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.ACCOUNT(id)),
    onSuccess: () => {
      invalidateFinancePositions(queryClient)
    },
  })
}

export function useRestoreAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(API_ENDPOINTS.FINANCE.ACCOUNT_RESTORE(id)),
    onSuccess: () => {
      invalidateFinancePositions(queryClient)
    },
  })
}
