"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { invalidateFinancePositions } from "@/src/modules/finance/hooks/use-balance-sheet"
import {
  emailMailboxesQuery,
  emailPendingQuery,
} from "@/src/modules/finance/lib/finance-query-options"
import { asFinanceArray } from "@/src/modules/finance/lib/planning-lists"
import {
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_PENDING_QUERY_KEY,
  FINANCE_EMAIL_SOURCES_QUERY_KEY,
} from "@/src/modules/finance/types/api"
import type {
  FinanceEmailAssignResult,
  FinanceEmailSource,
  FinanceEmailSyncTrigger,
  FinancePendingEmailMessage,
} from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_EMAIL_SOURCES_QUERY_KEY,
  })
  void queryClient.invalidateQueries({
    queryKey: FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  })
  void queryClient.invalidateQueries({
    queryKey: FINANCE_EMAIL_PENDING_QUERY_KEY,
  })
}

function importedFromEmail(
  result: FinanceEmailAssignResult | FinancePendingEmailMessage,
): result is FinanceEmailAssignResult {
  return (
    "assigned" in result &&
    result.assigned === true &&
    typeof result.transactionId === "string" &&
    result.transactionId.length > 0
  )
}

function invalidateEmailResult(
  queryClient: ReturnType<typeof useQueryClient>,
  result: FinanceEmailAssignResult | FinancePendingEmailMessage,
) {
  invalidate(queryClient)
  if (importedFromEmail(result)) {
    invalidateFinancePositions(queryClient)
  }
}

export type UpdateEmailSourceBody = {
  institutionId?: string
  label?: string
  bankSenderEmail?: string
  bankDomain?: string
}

export type CreateEmailSourceBody = {
  emailAddress: string
  institutionId: string
  bankSenderEmail: string
  label?: string
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

export function useEmailMailboxes(enabled: boolean) {
  return useQuery({
    ...emailMailboxesQuery(),
    enabled,
  })
}

export function useCreateEmailSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEmailSourceBody) =>
      apiPost<FinanceEmailSource>(API_ENDPOINTS.FINANCE.EMAIL_SOURCES, body),
    onSuccess: () => invalidate(queryClient),
  })
}

export function useDisconnectMailbox() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ENDPOINTS.FINANCE.EMAIL_MAILBOX(id)),
    onSuccess: () => invalidate(queryClient),
  })
}

export function usePendingEmailMessages(enabled: boolean) {
  return useQuery({
    ...emailPendingQuery(),
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

export function useAssignPendingEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { accountId?: string; cardId?: string }
    }) =>
      apiPost<FinanceEmailAssignResult>(
        API_ENDPOINTS.FINANCE.EMAIL_PENDING_ASSIGN(id),
        body,
      ),
    onSuccess: (result) => invalidateEmailResult(queryClient, result),
  })
}

export function useRetryPendingEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceEmailAssignResult | FinancePendingEmailMessage>(
        API_ENDPOINTS.FINANCE.EMAIL_PENDING_RETRY(id),
      ),
    onSuccess: (result) => invalidateEmailResult(queryClient, result),
  })
}
