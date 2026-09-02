"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { asFinanceArray } from "@/src/modules/finance/lib/planning-lists"
import { FINANCE_EMAIL_SOURCES_QUERY_KEY } from "@/src/modules/finance/types/api"
import type {
  FinanceEmailSource,
  FinanceEmailSyncTrigger,
} from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_EMAIL_SOURCES_QUERY_KEY,
  })
}

export type UpdateEmailSourceBody = {
  accountId?: string
  cardId?: string
  label?: string
  bankDomain?: string
}

export function useEmailSources(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_EMAIL_SOURCES_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceEmailSource>(
        await apiGet(API_ENDPOINTS.FINANCE.EMAIL_SOURCES),
      ),
    enabled,
  })
}

export function useUpdateEmailSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEmailSourceBody }) =>
      apiPatch<FinanceEmailSource>(
        API_ENDPOINTS.FINANCE.EMAIL_SOURCE(id),
        body,
      ),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDisconnectEmailSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ENDPOINTS.FINANCE.EMAIL_SOURCE(id)),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useTriggerEmailSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceEmailSyncTrigger>(
        API_ENDPOINTS.FINANCE.EMAIL_SOURCE_SYNC(id),
      ),
    onSuccess: () => invalidate(queryClient),
  })
}
