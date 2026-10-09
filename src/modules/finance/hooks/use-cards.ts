"use client"

import { apiDelete, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CardBalanceBody,
  CreateCardBody,
} from "@/src/modules/finance/lib/catalog-payloads"
import { cardsQuery } from "@/src/modules/finance/lib/finance-query-options"
import { FINANCE_CARDS_QUERY_KEY } from "@/src/modules/finance/types/api"
import type { FinanceCard, FinanceCardBalance } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  invalidateFinanceBalanceSheet,
  invalidateFinancePositions,
} from "@/src/modules/finance/hooks/use-balance-sheet"

function invalidateCards(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
  invalidateFinanceBalanceSheet(queryClient)
}

export function useCards(enabled: boolean) {
  return useQuery({
    ...cardsQuery(),
    enabled,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCardBody) =>
      apiPost<FinanceCard>(API_ENDPOINTS.FINANCE.CARDS, body),
    onSuccess: () => {
      invalidateCards(queryClient)
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceCard>(API_ENDPOINTS.FINANCE.CARD(id), body),
    onSuccess: () => {
      invalidateCards(queryClient)
    },
  })
}

export function useArchiveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<FinanceCard>(API_ENDPOINTS.FINANCE.CARD(id), { isActive: false }),
    onSuccess: () => {
      invalidateCards(queryClient)
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.CARD(id)),
    onSuccess: () => {
      invalidateFinancePositions(queryClient)
    },
  })
}

export function useUpdateCardBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CardBalanceBody }) =>
      apiPost<FinanceCardBalance>(API_ENDPOINTS.FINANCE.CARD_BALANCES(id), body),
    onSuccess: () => {
      invalidateCards(queryClient)
    },
  })
}

export function useDeleteCardBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currency }: { id: string; currency: string }) =>
      apiDelete(API_ENDPOINTS.FINANCE.CARD_BALANCE(id, currency)),
    onSuccess: () => {
      invalidateCards(queryClient)
    },
  })
}

export function useUpdateCardCreditLimit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { currency: string; creditLimit: number }
    }) =>
      apiPost<FinanceCardBalance>(API_ENDPOINTS.FINANCE.CARD_CREDIT_LIMIT(id), body),
    onSuccess: () => {
      invalidateCards(queryClient)
    },
  })
}
