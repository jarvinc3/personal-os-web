"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CardBalanceBody,
  CreateCardBody,
} from "@/src/modules/finance/lib/catalog-payloads"
import { FINANCE_CARDS_QUERY_KEY } from "@/src/modules/finance/types/api"
import type { FinanceCard, FinanceCardBalance } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCards(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_CARDS_QUERY_KEY,
    queryFn: () => apiGet<FinanceCard[]>(API_ENDPOINTS.FINANCE.CARDS),
    enabled,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCardBody) =>
      apiPost<FinanceCard>(API_ENDPOINTS.FINANCE.CARDS, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceCard>(API_ENDPOINTS.FINANCE.CARD(id), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
    },
  })
}

export function useArchiveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.CARD(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
    },
  })
}

export function useUpdateCardBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CardBalanceBody }) =>
      apiPost<FinanceCardBalance>(API_ENDPOINTS.FINANCE.CARD_BALANCES(id), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
    },
  })
}
