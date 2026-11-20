"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiGet, apiPost, apiPostEventStream } from "@/src/config/api-client"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { agentInvocationContextKey } from "@/src/modules/intelligence/lib/agent-chat-context"
import { readAgentStream } from "@/src/modules/intelligence/lib/agent-chat-stream"
import type {
  AgentConversationCreated,
  AgentConversationDetail,
  AgentConversationSummary,
  AgentInvocationContext,
  AgentSendMessageBody,
  AgentStreamEvent,
} from "@/src/modules/intelligence/types/agent-chat.types"

export const AGENT_CHAT_QUERY_KEY = ["intelligence", "agent-chat"] as const

export function useAgentConversation(conversationId: string | null) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: [...AGENT_CHAT_QUERY_KEY, "conversation", conversationId],
    queryFn: ({ signal }) =>
      apiGet<AgentConversationDetail>(
        API_ENDPOINTS.INTELLIGENCE.CONVERSATION(conversationId!),
        signal
      ),
    enabled: Boolean(session && conversationId),
  })
}

export function useLatestAgentConversation(
  context: AgentInvocationContext | null,
  enabled: boolean
) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: [...AGENT_CHAT_QUERY_KEY, "latest", context],
    queryFn: async ({ signal }) => {
      const contextKey = await agentInvocationContextKey(context!)
      return apiGet<{ conversation: AgentConversationDetail | null }>(
        `${API_ENDPOINTS.INTELLIGENCE.CONVERSATION_LATEST}?context=${contextKey}`,
        signal
      )
    },
    enabled: Boolean(session && context && enabled),
  })
}

export function useAgentConversations(enabled: boolean) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: [...AGENT_CHAT_QUERY_KEY, "list"],
    queryFn: ({ signal }) =>
      apiGet<AgentConversationSummary[]>(
        API_ENDPOINTS.INTELLIGENCE.CONVERSATIONS,
        signal
      ),
    enabled: Boolean(session && enabled),
  })
}

export function useCreateAgentConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (context: AgentInvocationContext | null) =>
      apiPost<AgentConversationCreated>(
        API_ENDPOINTS.INTELLIGENCE.CONVERSATIONS,
        context ? { context } : {}
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...AGENT_CHAT_QUERY_KEY, "list"],
      })
    },
  })
}

export function useSendAgentMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      clientMessageId,
      context,
      signal,
      onEvent,
    }: {
      conversationId: string
      content: string
      clientMessageId: string
      context: AgentInvocationContext | null
      signal?: AbortSignal
      onEvent: (event: AgentStreamEvent) => void
    }) => {
      const body: AgentSendMessageBody = {
        content,
        clientMessageId,
        stream: true,
        ...(context ? { context } : {}),
      }
      const stream = await apiPostEventStream(
        API_ENDPOINTS.INTELLIGENCE.CONVERSATION_MESSAGES(conversationId),
        body,
        signal
      )
      return readAgentStream({ body: stream, signal, onEvent })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...AGENT_CHAT_QUERY_KEY, "conversation"],
        }),
        queryClient.invalidateQueries({
          queryKey: [...AGENT_CHAT_QUERY_KEY, "latest"],
        }),
        queryClient.invalidateQueries({
          queryKey: [...AGENT_CHAT_QUERY_KEY, "list"],
        }),
      ])
    },
  })
}
