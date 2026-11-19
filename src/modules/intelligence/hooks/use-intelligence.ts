"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import type { EmailConnectBody } from "@/src/modules/intelligence/email-connect"
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
export const INTELLIGENCE_PAGE_SIZE = 50

function fetchIntelligenceDashboard(signal: AbortSignal) {
  return apiGet<IntelligenceDashboard>(
    API_ENDPOINTS.INTELLIGENCE.DASHBOARD,
    signal
  )
}

export function useIntelligence() {
  const {
    status: emailSocketStatus,
    hasPendingMessageUpdates,
    markMessagesPending,
    acknowledgeMessages,
  } = useAiEmailSyncSocket()
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery({
    queryKey: INTELLIGENCE_QUERY_KEY,
    queryFn: ({ signal }) => fetchIntelligenceDashboard(signal),
    enabled: Boolean(session),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const connection = query.state.data?.connection
      if (!connection?.connected) {
        return false
      }
      if (
        connection.lastSyncErrorCode ||
        connection.syncProgress?.status === "failed" ||
        (connection.syncProgress?.status === "scheduled" &&
          connection.syncProgress.errorCode === "classification_failed")
      ) {
        return 30_000
      }
      return connection.syncInProgress ||
        (!connection.initialSyncCompletedAt && !connection.lastSyncErrorCode)
        ? 5_000
        : false
    },
  })
  const oauthDiagnosticsQuery = useQuery({
    queryKey: ["intelligence", "oauth-diagnostics"],
    queryFn: ({ signal }) =>
      apiGet<AiEmailOAuthDiagnostics>(
        API_ENDPOINTS.INTELLIGENCE.OAUTH_DIAGNOSTICS,
        signal
      ),
    enabled: Boolean(session && dashboardQuery.data?.connection.connected),
    staleTime: 60_000,
    refetchInterval: (query) =>
      query.state.data?.configured === false ? 60_000 : false,
  })
  const messagesQuery = useInfiniteQuery({
    queryKey: INTELLIGENCE_MESSAGES_QUERY_KEY,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        limit: String(INTELLIGENCE_PAGE_SIZE),
      })
      if (pageParam) {
        params.set("cursor", pageParam)
      }
      return apiGet<AiEmailMessagesPage>(
        `${API_ENDPOINTS.INTELLIGENCE.MESSAGES}?${params.toString()}`,
        signal
      )
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: Boolean(session && dashboardQuery.data?.connection.connected),
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
  const refreshMessages = useCallback(async () => {
    acknowledgeMessages()
    await queryClient.resetQueries({
      queryKey: INTELLIGENCE_MESSAGES_QUERY_KEY,
    })
  }, [acknowledgeMessages, queryClient])
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
