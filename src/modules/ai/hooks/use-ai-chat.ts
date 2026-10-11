"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import { AI_SESSIONS_QUERY_KEY } from "@/src/modules/ai/hooks/use-ai-sessions"
import { useAiSideEffects } from "@/src/modules/ai/hooks/use-ai-side-effects"
import {
  streamAiChat,
  type StreamChatError,
} from "@/src/modules/ai/lib/ai-chat-stream"
import type {
  ChatMessage,
  ChatResponse,
  ModuleChatSlug,
} from "@/src/modules/ai/types/chat.types"
import { parseModuleChatSlug } from "@/src/modules/ai/types/chat.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { v4 as uuidv4 } from "uuid"

export type SendChatInput = {
  sessionId?: string
  messages: ChatMessage[]
  clientMessageId?: string
  onStreamChunk?: (content: string) => void
  onStreamStart?: (meta: {
    sessionId: string
    provider: string
    model: string
    moduleSlug?: ModuleChatSlug
    moduleLabel?: string
    requiresConfirmation?: boolean
  }) => void
  onModuleContext?: (slug: ModuleChatSlug, label: string) => void
  onStreamStatus?: (message: string) => void
}

function shouldFallbackToJson(error: unknown, streamStarted: boolean): boolean {
  if (streamStarted) {
    return false
  }
  if (error instanceof Error && "phase" in error) {
    const phase = (error as StreamChatError).phase
    return phase === "network" || phase === "parse"
  }
  return false
}

async function chatViaJson(
  input: SendChatInput,
  clientMessageId: string,
  applySideEffects: ReturnType<typeof useAiSideEffects>
): Promise<ChatResponse> {
  const response = await apiPost<ChatResponse>(API_ENDPOINTS.AI.CHAT, {
    sessionId: input.sessionId,
    messages: input.messages,
    clientMessageId,
  })

  input.onStreamStart?.({
    sessionId: response.sessionId,
    provider: response.provider,
    model: response.model,
    moduleSlug: response.moduleSlug,
    moduleLabel: response.moduleLabel,
    requiresConfirmation: response.requiresConfirmation,
  })
  if (response.content && input.onStreamChunk) {
    let accumulated = ""
    for (let i = 0; i < response.content.length; i += 20) {
      accumulated += response.content.slice(i, i + 20)
      input.onStreamChunk(accumulated)
      await new Promise((resolve) => setTimeout(resolve, 16))
    }
  }

  input.onModuleContext?.(
    parseModuleChatSlug(response.moduleSlug),
    response.moduleLabel
  )
  await applySideEffects(response.sideEffects)
  return response
}

export function useAiChat(
  onModuleContext?: (slug: ModuleChatSlug, label: string) => void
) {
  const queryClient = useQueryClient()
  const applySideEffects = useAiSideEffects(onModuleContext)

  return useMutation({
    mutationFn: async (input: SendChatInput): Promise<ChatResponse> => {
      const clientMessageId = input.clientMessageId ?? uuidv4()

      let aggregated = ""
      let completedResponse: ChatResponse | undefined
      let streamStarted = false

      try {
        await streamAiChat({
          sessionId: input.sessionId,
          messages: input.messages,
          clientMessageId,
          onEvent: (event) => {
            if (event.type === "start") {
              streamStarted = true
              input.onStreamStart?.({
                sessionId: event.sessionId,
                provider: event.provider,
                model: event.model,
                moduleSlug: event.moduleSlug
                  ? parseModuleChatSlug(event.moduleSlug)
                  : undefined,
                moduleLabel: event.moduleLabel,
                requiresConfirmation: event.requiresConfirmation,
              })
            }
            if (event.type === "reset") {
              aggregated = ""
              input.onStreamChunk?.("")
            }
            if (event.type === "status") {
              input.onStreamStatus?.(event.message)
            }
            if (event.type === "chunk") {
              aggregated += event.content
              input.onStreamChunk?.(aggregated)
            }
            if (event.type === "done") {
              const markdownContent =
                aggregated ||
                event.blocks?.find((block) => block.type === "markdown")
                  ?.content ||
                ""
              const blocks = event.blocks?.length
                ? event.blocks.map((block) =>
                    block.type === "markdown"
                      ? { ...block, content: markdownContent }
                      : block
                  )
                : [{ type: "markdown" as const, content: markdownContent }]
              completedResponse = {
                sessionId: event.sessionId,
                provider: event.provider,
                model: event.model,
                moduleSlug: parseModuleChatSlug(event.moduleSlug),
                moduleLabel: event.moduleLabel ?? "General",
                content: markdownContent,
                requiresConfirmation: event.requiresConfirmation,
                actions: event.actions,
                sideEffects: event.sideEffects,
                blocks,
              }
            }
            if (event.type === "error") {
              throw new Error(event.message)
            }
          },
        })

        if (completedResponse) {
          input.onModuleContext?.(
            completedResponse.moduleSlug,
            completedResponse.moduleLabel
          )
          await applySideEffects(completedResponse.sideEffects)
          return completedResponse
        }

        if (streamStarted && input.sessionId) {
          const session = await apiGet<{
            id: string
            messages: {
              role: string
              content: string
              metadata?: Record<string, unknown>
            }[]
          }>(API_ENDPOINTS.AI.SESSION(input.sessionId))
          const lastAssistant = [...(session.messages ?? [])]
            .reverse()
            .find((m) => m.role === "assistant")
          if (lastAssistant) {
            const meta = lastAssistant.metadata ?? {}
            return {
              sessionId: input.sessionId,
              provider: (meta.provider as string) ?? "unknown",
              model: (meta.model as string) ?? "unknown",
              moduleSlug: parseModuleChatSlug(
                meta.moduleSlug as string | undefined
              ),
              moduleLabel:
                typeof meta.moduleLabel === "string"
                  ? meta.moduleLabel
                  : "General",
              content: lastAssistant.content,
              actions: meta.actions as ChatResponse["actions"],
              sideEffects: meta.sideEffects as ChatResponse["sideEffects"],
              blocks: meta.blocks as ChatResponse["blocks"],
            }
          }
        }

        throw new Error("Stream ended without completion")
      } catch (error) {
        if (shouldFallbackToJson(error, streamStarted)) {
          return chatViaJson(input, clientMessageId, applySideEffects)
        }
        throw error
      }
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY })
      await queryClient.invalidateQueries({
        queryKey: ["ai", "session", response.sessionId],
      })
    },
  })
}
