"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import type { EmailConnectBody } from "@/src/modules/intelligence/email-connect"
import { resolveEmailSyncRefetchInterval } from "@/src/modules/intelligence/lib/email-sync-polling"
import {
  buildMessagesPath,
  normalizeMessagesFilter,
  type MessagesFilter,
} from "@/src/modules/intelligence/lib/messages-request"
import type {
  AiEmailMessageDetail,
  AiEmailMessagesPage,
  AiEmailOAuthDiagnostics,
  IntelligenceDashboard,
} from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { useAiEmailSyncSocket } from "@/src/modules/intelligence/hooks/use-ai-email-sync-socket"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useCallback, useRef } from "react"

export const INTELLIGENCE_QUERY_KEY = ["intelligence", "dashboard"] as const
export const INTELLIGENCE_MESSAGES_QUERY_KEY = [
  "intelligence",
  "messages",
] as const

function fetchIntelligenceDashboard(signal: AbortSignal) {
  return apiGet<IntelligenceDashboard>(
    API_ENDPOINTS.INTELLIGENCE.DASHBOARD,
    signal
  )
}

function useIntelligenceDashboardQuery(isEnabled: boolean) {
  return useQuery({
    queryKey: INTELLIGENCE_QUERY_KEY,
    queryFn: ({ signal }) => fetchIntelligenceDashboard(signal),
    enabled: isEnabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      resolveEmailSyncRefetchInterval(query.state.data?.connection),
  })
}

function useOauthDiagnosticsQuery(isEnabled: boolean) {
  return useQuery({
    queryKey: ["intelligence", "oauth-diagnostics"],
    queryFn: ({ signal }) =>
      apiGet<AiEmailOAuthDiagnostics>(
        API_ENDPOINTS.INTELLIGENCE.OAUTH_DIAGNOSTICS,
        signal
      ),
    enabled: isEnabled,
    staleTime: 60_000,
    refetchInterval: (query) =>
      query.state.data?.configured === false ? 60_000 : false,
  })
}

function useMessagesQuery({
  messageFilter,
  isEnabled,
}: {
  messageFilter: MessagesFilter
  isEnabled: boolean
}) {
  const messagesFilter = normalizeMessagesFilter(messageFilter)
  const messagesQuery = useInfiniteQuery({
    queryKey: [...INTELLIGENCE_MESSAGES_QUERY_KEY, messagesFilter],
    queryFn: ({ pageParam, signal }) =>
      apiGet<AiEmailMessagesPage>(
        buildMessagesPath({ ...messagesFilter, cursor: pageParam }),
        signal
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: isEnabled,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const nextPageRequestRef = useRef(false)
  const fetchNextMessagesPage = messagesQuery.fetchNextPage
  const loadNextMessagesPage = useCallback(async () => {
    if (nextPageRequestRef.current) {
      return
    }
    nextPageRequestRef.current = true
    try {
      await fetchNextMessagesPage()
    } finally {
      nextPageRequestRef.current = false
    }
  }, [fetchNextMessagesPage])

  return { messagesQuery, loadNextMessagesPage }
}

function useEmailSyncMutations({
  markMessagesPending,
  acknowledgeMessages,
}: {
  markMessagesPending: () => void
  acknowledgeMessages: () => void
}) {
  const queryClient = useQueryClient()
  const connectMutation = useMutation({
    mutationFn: (body: EmailConnectBody) =>
      apiPost<{ authorizationUrl: string }>(
        API_ENDPOINTS.INTELLIGENCE.CONNECT_EMAIL,
        body
      ),
    onSuccess: ({ authorizationUrl }) => {
      window.location.assign(authorizationUrl)
    },
  })
  const syncMutation = useMutation({
    mutationFn: () =>
      apiPost<{ connected: boolean; syncStarted: boolean }>(
        API_ENDPOINTS.INTELLIGENCE.SYNC_EMAIL
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: INTELLIGENCE_QUERY_KEY,
      })
      markMessagesPending()
    },
  })
  const resetMutation = useMutation({
    mutationFn: () =>
      apiPost<{ connected: boolean; deletedMessages: number }>(
        API_ENDPOINTS.INTELLIGENCE.RESET_EMAIL,
        { confirmed: true }
      ),
    onSuccess: async ({ deletedMessages }) => {
      appToast.success({
        text1: "Correo reiniciado",
        text2: `${deletedMessages} mensajes eliminados. El histórico volverá a importarse desde el 1 de enero de 2026.`,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: INTELLIGENCE_QUERY_KEY }),
        queryClient.resetQueries({
          queryKey: INTELLIGENCE_MESSAGES_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["intelligence", "evidence"],
        }),
      ])
      acknowledgeMessages()
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo reiniciar el correo",
        text2: error.message,
      })
    },
  })

  return { connectMutation, syncMutation, resetMutation }
}

export function useIntelligence({
  messageFilter,
}: {
  messageFilter: MessagesFilter
}) {
  const {
    status: emailSocketStatus,
    hasPendingMessageUpdates,
    markMessagesPending,
    acknowledgeMessages,
  } = useAiEmailSyncSocket()
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const isSessionEnabled = Boolean(session)
  const dashboardQuery = useIntelligenceDashboardQuery(isSessionEnabled)
  const isEmailConnected =
    isSessionEnabled && Boolean(dashboardQuery.data?.connection.connected)
  const oauthDiagnosticsQuery = useOauthDiagnosticsQuery(isEmailConnected)
  const { messagesQuery, loadNextMessagesPage } = useMessagesQuery({
    messageFilter,
    isEnabled: isEmailConnected,
  })
  const { connectMutation, syncMutation, resetMutation } =
    useEmailSyncMutations({
      markMessagesPending,
      acknowledgeMessages,
    })
  const refreshMessages = useCallback(async () => {
    acknowledgeMessages()
    await queryClient.resetQueries({
      queryKey: INTELLIGENCE_MESSAGES_QUERY_KEY,
    })
  }, [acknowledgeMessages, queryClient])

  return {
    dashboardQuery,
    oauthDiagnosticsQuery,
    messagesQuery,
    hasPendingMessageUpdates,
    refreshMessages,
    loadNextMessagesPage,
    connectMutation,
    syncMutation,
    resetMutation,
    emailSocketStatus,
  }
}

export function useIntelligenceRole() {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: INTELLIGENCE_QUERY_KEY,
    queryFn: ({ signal }) => fetchIntelligenceDashboard(signal),
    enabled: Boolean(session),
    staleTime: 60_000,
    select: (dashboard) => dashboard.role,
  })
}

export function useIntelligenceMessage(messageId: string | null) {
  const session = useAppStore((state) => state.session)
  return useQuery({
    queryKey: ["intelligence", "message", messageId],
    queryFn: ({ signal }) =>
      apiGet<AiEmailMessageDetail>(
        API_ENDPOINTS.INTELLIGENCE.MESSAGE(messageId!),
        signal
      ),
    enabled: Boolean(session && messageId),
  })
}
