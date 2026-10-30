"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import type {
  AiEmailMessageDetail,
  AiEmailMessagesPage,
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
  const emailSocketStatus = useAiEmailSyncSocket()
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
      return connection?.connected &&
        (connection.syncInProgress ||
          (!connection.initialSyncCompletedAt && !connection.lastSyncErrorCode))
        ? 5_000
        : false
    },
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
    staleTime: 15_000,
  })
  const connectMutation = useMutation({
    mutationFn: () =>
      apiPost<{ authorizationUrl: string }>(
        API_ENDPOINTS.INTELLIGENCE.CONNECT_EMAIL
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: INTELLIGENCE_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: INTELLIGENCE_MESSAGES_QUERY_KEY,
        }),
      ])
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
        queryClient.invalidateQueries({
          queryKey: INTELLIGENCE_MESSAGES_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["intelligence", "evidence"],
        }),
      ])
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
    messagesQuery,
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
