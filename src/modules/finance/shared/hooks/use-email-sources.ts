"use client"

import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import { invalidateFinancePositions } from "./use-balance-sheet"
import {
  emailMailboxesQuery,
  emailMessagesQuery,
  emailPendingQuery,
} from "@/src/modules/finance/shared/lib/finance-query-options"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  hasRunningEmailSync,
  RUNNING_SYNC_REFETCH_MS,
} from "@/src/modules/finance/shared/lib/email-sync-display"
import { syncFailureReason } from "@/src/modules/finance/shared/lib/gmail-oauth"
import { asFinanceArray } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_MESSAGES_QUERY_KEY,
  FINANCE_EMAIL_PENDING_QUERY_KEY,
  FINANCE_EMAIL_SOURCES_QUERY_KEY,
} from "@/src/modules/finance/shared/types/api"
import { appToast } from "@/src/shared/lib/app-toast"
import type {
  FinanceEmailAssignResult,
  FinanceEmailSource,
  FinanceEmailSyncTrigger,
  FinancePendingEmailMessage,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { API_BASE_URL } from "@/src/config/api-base-url"
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
  void queryClient.invalidateQueries({
    queryKey: FINANCE_EMAIL_MESSAGES_QUERY_KEY,
  })
}

function importedFromEmail(
  result: FinanceEmailAssignResult | FinancePendingEmailMessage
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
  result: FinanceEmailAssignResult | FinancePendingEmailMessage
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
  bankSenderEmails?: string[]
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
        await apiGet(API_ENDPOINTS.FINANCE.EMAIL_SOURCES)
      ),
    enabled,
  })
}

export function useEmailMailboxes(enabled: boolean) {
  return useQuery({
    ...emailMailboxesQuery(),
    enabled,
    refetchInterval: (query) =>
      hasRunningEmailSync(query.state.data ?? [])
        ? RUNNING_SYNC_REFETCH_MS
        : false,
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

export function useRecentEmailMessages(enabled: boolean) {
  const queryClient = useQueryClient()
  return useQuery({
    ...emailMessagesQuery(),
    enabled,
    refetchInterval: () => {
      const mailboxes = queryClient.getQueryData(
        FINANCE_EMAIL_MAILBOXES_QUERY_KEY
      )
      return hasRunningEmailSync(Array.isArray(mailboxes) ? mailboxes : [])
        ? RUNNING_SYNC_REFETCH_MS
        : false
    },
  })
}

export function useApiReady(enabled: boolean) {
  return useQuery({
    queryKey: ["api-health-ready"],
    enabled,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/health/ready`)
      return { ready: response.ok }
    },
    retry: false,
    refetchInterval: 15_000,
  })
}

export function useUpdateEmailSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEmailSourceBody }) =>
      apiPatch<FinanceEmailSource>(
        API_ENDPOINTS.FINANCE.EMAIL_SOURCE(id),
        body
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
    mutationFn: ({
      id,
      forceFullSync = false,
    }: {
      id: string
      forceFullSync?: boolean
    }) => {
      const path = forceFullSync
        ? `${API_ENDPOINTS.FINANCE.EMAIL_SOURCE_SYNC(id)}?forceFullSync=true`
        : API_ENDPOINTS.FINANCE.EMAIL_SOURCE_SYNC(id)
      return apiPost<FinanceEmailSyncTrigger>(path)
    },
    onSuccess: () => invalidate(queryClient),
  })
}

export function useRunEmailSync(emailSyncEnabled: boolean) {
  const mutation = useTriggerEmailSync()

  const run = async (
    sourceId: string,
    options?: { forceFullSync?: boolean }
  ) => {
    if (!emailSyncEnabled) {
      appToast.error({
        text1: "Sincronización de correo desactivada",
        text2: "Actívala en Ajustes → Finanzas.",
      })
      return
    }
    try {
      const result = await mutation.mutateAsync({
        id: sourceId,
        forceFullSync: options?.forceFullSync,
      })
      const reason = syncFailureReason(result)
      if (reason) {
        appToast.error({ text1: "Sync no encolado", text2: reason })
        return
      }
      appToast.success({
        text1: options?.forceFullSync ? "Relectura encolada" : "Sync encolado",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return {
    run,
    isPending: mutation.isPending,
    pendingSourceId: mutation.isPending
      ? (mutation.variables?.id ?? null)
      : null,
  }
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
        body
      ),
    onSuccess: (result) => invalidateEmailResult(queryClient, result),
  })
}

export function useRetryPendingEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<FinanceEmailAssignResult | FinancePendingEmailMessage>(
        API_ENDPOINTS.FINANCE.EMAIL_PENDING_RETRY(id)
      ),
    onSuccess: (result) => invalidateEmailResult(queryClient, result),
  })
}

export function useCompletePendingAmount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      apiPost<FinanceEmailAssignResult | FinancePendingEmailMessage>(
        API_ENDPOINTS.FINANCE.EMAIL_PENDING_AMOUNT(id),
        { amount }
      ),
    onSuccess: (result) => invalidateEmailResult(queryClient, result),
  })
}

export function useDiscoveredSenders(
  sourceId: string | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["finance-discovered-senders", sourceId],
    enabled: Boolean(sourceId) && enabled,
    queryFn: () =>
      apiGet<{ email: string; count: number }[]>(
        API_ENDPOINTS.FINANCE.EMAIL_SOURCE_DISCOVERED_SENDERS(sourceId!)
      ),
  })
}

export function useAddSourceSenders() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, emails }: { id: string; emails: string[] }) =>
      apiPost<FinanceEmailSource>(
        API_ENDPOINTS.FINANCE.EMAIL_SOURCE_SENDERS(id),
        { emails }
      ),
    onSuccess: () => invalidate(queryClient),
  })
}
