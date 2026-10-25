"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import type {
  AiEmailMessageDetail,
  AiEmailMessagesPage,
  IntelligenceDashboard,
} from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
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

export function useIntelligence() {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery({
    queryKey: INTELLIGENCE_QUERY_KEY,
    queryFn: ({ signal }) =>
      apiGet<IntelligenceDashboard>(
        API_ENDPOINTS.INTELLIGENCE.DASHBOARD,
        signal
      ),
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

  return { dashboardQuery, messagesQuery, connectMutation, syncMutation }
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
