"use client"

import { apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type { CreateAccountBody } from "@/src/modules/finance/lib/catalog-payloads"
import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
} from "@/src/modules/finance/types/api"
import type { FinanceAccount } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useAccounts(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_ACCOUNTS_QUERY_KEY,
    queryFn: () => apiGet<FinanceAccount[]>(API_ENDPOINTS.FINANCE.ACCOUNTS),
    enabled,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAccountBody) =>
      apiPost<FinanceAccount>(API_ENDPOINTS.FINANCE.ACCOUNTS, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_ACCOUNTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: Record<string, unknown>
    }) => apiPatch<FinanceAccount>(API_ENDPOINTS.FINANCE.ACCOUNT(id), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_ACCOUNTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
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
      void queryClient.invalidateQueries({ queryKey: FINANCE_ACCOUNTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
    },
  })
}
