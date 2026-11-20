import type {
  AgentConversationAnswer,
  AgentStreamEvent,
} from "@/src/modules/intelligence/types/agent-chat.types"

const EVENT_SEPARATOR = "\n\n"

/** Separa bloques SSE completos y deja el resto para el siguiente trozo. */
export function splitSseBlocks(buffer: string): {
  blocks: string[]
  rest: string
} {
  const normalized = buffer.replace(/\r\n/g, "\n")
  const parts = normalized.split(EVENT_SEPARATOR)
  const rest = parts.pop() ?? ""
  return { blocks: parts.filter((block) => block.trim().length > 0), rest }
}

/** Devuelve el `data` de un bloque SSE; null si el bloque no lo trae. */
export function readSseData(block: string): string | null {
  const eventPayload = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).replace(/^ /, ""))
    .join("\n")
  return eventPayload.length > 0 ? eventPayload : null
}

function parseEventData(eventPayload: string): AgentStreamEvent {
  const parsed: unknown = JSON.parse(eventPayload)
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    typeof (parsed as { type?: unknown }).type !== "string"
  ) {
    throw new Error("El agente devolvió un evento sin tipo")
  }
  return parsed as AgentStreamEvent
}

/**
 * Lee el cuerpo SSE del agente y devuelve la respuesta del evento `done`.
 * Si el servidor manda `error`, se lanza con su mensaje para que la vista
 * ofrezca reintentar el mismo turno.
 */
export async function readAgentStream({
  body,
  signal,
  onEvent,
}: {
  body: ReadableStream<Uint8Array>
  signal?: AbortSignal
  onEvent: (event: AgentStreamEvent) => void
}): Promise<AgentConversationAnswer> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let completed: AgentConversationAnswer | null = null

  const consume = (blocks: string[]) => {
    for (const block of blocks) {
      const eventPayload = readSseData(block)
      if (!eventPayload) {
        continue
      }
      const event = parseEventData(eventPayload)
      if (event.type === "error") {
        throw new Error(event.message)
      }
      onEvent(event)
      if (event.type === "done") {
        const { type: eventType, ...answer } = event
        void eventType
        completed = answer
      }
    }
  }

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("La respuesta se canceló", "AbortError")
      }
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const { blocks, rest } = splitSseBlocks(buffer)
      buffer = rest
      consume(blocks)
    }
    buffer += decoder.decode()
    consume(splitSseBlocks(`${buffer}\n\n`).blocks)
  } finally {
    reader.releaseLock()
  }

  if (!completed) {
    throw new Error("La respuesta del agente terminó sin completarse")
  }
  return completed
}
