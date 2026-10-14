"use client"

import { apiGet, apiPatch, apiPost, apiPostForm } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  FINANCE_RECURRING_QUERY_KEY,
  FINANCE_SUBSCRIPTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceSubscription,
  FinanceSubscriptionPayment,
  FinanceSubscriptionStatus,
  FinanceSubscriptionSummary,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const FINANCE_SUBSCRIPTION_PAGE_SIZE = 20
export const FINANCE_SUBSCRIPTION_PAYMENT_PAGE_SIZE = 20

export type SubscriptionsQueryParams = {
  status?: FinanceSubscriptionStatus
  currency?: string
  q?: string
}

function invalidateSubscriptions(
  queryClient: ReturnType<typeof useQueryClient>
): void {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_SUBSCRIPTIONS_QUERY_KEY,
  })
  void queryClient.invalidateQueries({ queryKey: FINANCE_RECURRING_QUERY_KEY })
}

export function useSubscriptions(
  enabled: boolean,
  params: SubscriptionsQueryParams = {}
) {
  return useInfiniteFinanceList<FinancePaginated<FinanceSubscription>>({
    queryKey: [...FINANCE_SUBSCRIPTIONS_QUERY_KEY, "list", params],
    endpoint: API_ENDPOINTS.FINANCE.SUBSCRIPTIONS,
    params: { limit: FINANCE_SUBSCRIPTION_PAGE_SIZE, ...params },
    enabled,
  })
}

export function useSubscriptionSummary(enabled: boolean) {
  return useQuery({
    queryKey: [...FINANCE_SUBSCRIPTIONS_QUERY_KEY, "summary"],
    queryFn: () =>
      apiGet<FinanceSubscriptionSummary>(
        API_ENDPOINTS.FINANCE.SUBSCRIPTION_SUMMARY
      ),
    enabled,
  })
}

export function useSubscription(enabled: boolean, id: string | null) {
  return useQuery({
    queryKey: [...FINANCE_SUBSCRIPTIONS_QUERY_KEY, "detail", id],
    queryFn: () =>
      apiGet<FinanceSubscription>(API_ENDPOINTS.FINANCE.SUBSCRIPTION(id!)),
    enabled: enabled && Boolean(id),
  })
}

export function useSubscriptionPayments(enabled: boolean, id: string | null) {
  return useInfiniteFinanceList<FinancePaginated<FinanceSubscriptionPayment>>({
    queryKey: [...FINANCE_SUBSCRIPTIONS_QUERY_KEY, "payments", id],
    endpoint: id ? API_ENDPOINTS.FINANCE.SUBSCRIPTION_PAYMENTS(id) : "",
    params: { limit: FINANCE_SUBSCRIPTION_PAYMENT_PAGE_SIZE },
    enabled: enabled && Boolean(id),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<FinanceSubscription>(API_ENDPOINTS.FINANCE.SUBSCRIPTIONS, body),
    onSuccess: () => invalidateSubscriptions(queryClient),
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceSubscription>(
        API_ENDPOINTS.FINANCE.SUBSCRIPTION(id),
        body
      ),
    onSuccess: () => invalidateSubscriptions(queryClient),
  })
}

function useSubscriptionStatusAction(
  action: (id: string) => string,
  successText: string
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<FinanceSubscription>(action(id), {}),
    onSuccess: () => invalidateSubscriptions(queryClient),
    meta: { successText },
  })
}

export function usePauseSubscription() {
  return useSubscriptionStatusAction(
    API_ENDPOINTS.FINANCE.SUBSCRIPTION_PAUSE,
    "Suscripción pausada"
  )
}

export function useResumeSubscription() {
  return useSubscriptionStatusAction(
    API_ENDPOINTS.FINANCE.SUBSCRIPTION_RESUME,
    "Suscripción reanudada"
  )
}

export function useCancelSubscription() {
  return useSubscriptionStatusAction(
    API_ENDPOINTS.FINANCE.SUBSCRIPTION_CANCEL,
    "Suscripción cancelada"
  )
}

export function useRecordSubscriptionPayment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<FinanceSubscriptionPayment>(
        API_ENDPOINTS.FINANCE.SUBSCRIPTION_PAYMENTS(id),
        body
      ),
    onSuccess: () => invalidateSubscriptions(queryClient),
  })
}

export function useUploadSubscriptionLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const body = new FormData()
      body.append("file", file)
      return apiPostForm<{ logoUrl: string | null }>(
        API_ENDPOINTS.FINANCE.SUBSCRIPTION_LOGO(id),
        body
      )
    },
    onSuccess: () => invalidateSubscriptions(queryClient),
  })
}
