import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import type {
  ChatContext,
  ChatMessage,
  ChatStreamEvent,
} from "@/src/modules/ai/types/chat.types"
import { API_BASE_URL } from "@/src/shared/constants/api-endpoints"

export type StreamChatOptions = {
  sessionId?: string
  messages: ChatMessage[]
  clientMessageId?: string
  context?: ChatContext | null
  signal?: AbortSignal
  onEvent: (event: ChatStreamEvent) => void
}

export type StreamChatError = Error & { phase: "network" | "parse" | "server" }

function streamError(
  message: string,
  phase: StreamChatError["phase"]
): StreamChatError {
  const err = new Error(message) as StreamChatError
  err.phase = phase
  return err
}

export async function streamAiChat(options: StreamChatOptions): Promise<void> {
  const {
    data: { session },
  } = await getSupabaseBrowserClient().auth.getSession()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  }

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sessionId: options.sessionId,
        messages: options.messages,
        clientMessageId: options.clientMessageId,
        context: options.context ?? undefined,
      }),
      signal: options.signal,
    })
  } catch {
    throw streamError("Network error before server response", "network")
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message =
      typeof body.message === "string"
        ? body.message
        : `HTTP ${response.status}`
    if (response.status >= 500 || response.status === 0) {
      throw streamError(message, "network")
    }
    throw streamError(message, "server")
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw streamError("Streaming not supported on this client", "parse")
  }

  const decoder = new TextDecoder()
  let buffer = ""
  let receivedDone = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""

    for (const part of parts) {
      for (const line of part.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) {
          continue
        }
        const json = trimmed.slice(5).trim()
        if (!json) {
          continue
        }
        try {
          const event = JSON.parse(json) as ChatStreamEvent
          if (event.type === "done") {
            receivedDone = true
          }
          options.onEvent(event)
        } catch {
          // ignore malformed chunks
        }
      }
    }
  }

  if (buffer.trim()) {
    const trimmed = buffer.trim()
    if (trimmed.startsWith("data:")) {
      try {
        const event = JSON.parse(trimmed.slice(5).trim()) as ChatStreamEvent
        if (event.type === "done") {
          receivedDone = true
        }
        options.onEvent(event)
      } catch {
        // ignore
      }
    }
  }

  if (!receivedDone) {
    throw streamError("Stream ended without done event", "parse")
  }
}
