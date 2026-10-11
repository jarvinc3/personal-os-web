import { resolveMessageBlocks } from "@/src/modules/ai/lib/resolve-message-blocks"
import type {
  AiActionSummary,
  AiSessionMessage,
  ChatBlock,
  ChatMessage,
} from "@/src/modules/ai/types/chat.types"

export type UiMessage = ChatMessage & {
  id: string
  clientMessageId?: string
  blocks?: ChatBlock[]
  actions?: AiActionSummary[]
  moduleLabel?: string
  provider?: string
  model?: string
  streamingStatus?: string
}

function mapSessionMessage(message: AiSessionMessage): UiMessage {
  const blocks = message.metadata.blocks as ChatBlock[] | undefined
  const actions = message.metadata.actions as AiActionSummary[] | undefined

  return {
    id: message.id,
    role: message.role as UiMessage["role"],
    content: message.content,
    clientMessageId:
      message.clientMessageId ??
      (typeof message.metadata.clientMessageId === "string"
        ? message.metadata.clientMessageId
        : undefined),
    actions,
    blocks: resolveMessageBlocks(message.content, blocks, actions),
    moduleLabel:
      typeof message.metadata.moduleLabel === "string"
        ? message.metadata.moduleLabel
        : undefined,
    provider:
      typeof message.metadata.provider === "string"
        ? message.metadata.provider
        : undefined,
    model:
      typeof message.metadata.model === "string"
        ? message.metadata.model
        : undefined,
  }
}

function isVisibleSessionMessage(message: AiSessionMessage): boolean {
  return (
    (message.role === "user" || message.role === "assistant") &&
    message.content.trim().length > 0 &&
    message.content.trim() !== "[tool_calls]" &&
    message.metadata.phase !== "tool_request"
  )
}

function messageKey(
  message: Pick<UiMessage, "id" | "clientMessageId" | "role">
): string {
  if (message.clientMessageId) {
    return `${message.role}:${message.clientMessageId}`
  }
  return `id:${message.id}`
}

export function getUiMessageKey(
  message: Pick<UiMessage, "id" | "clientMessageId" | "role">
): string {
  return messageKey(message)
}

export function mergeSessionMessages(
  localMessages: UiMessage[],
  serverMessages: AiSessionMessage[]
): UiMessage[] {
  const merged = new Map<string, UiMessage>()

  for (const message of localMessages) {
    merged.set(messageKey(message), message)
  }

  for (const serverMessage of serverMessages.filter(isVisibleSessionMessage)) {
    const mapped = mapSessionMessage(serverMessage)
    const key = messageKey(mapped)
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, mapped)
      continue
    }

    const preferServerContent =
      mapped.content.trim().length >= existing.content.trim().length

    merged.set(key, {
      ...existing,
      ...mapped,
      id: mapped.id,
      content: preferServerContent ? mapped.content : existing.content,
      blocks: mapped.blocks?.length ? mapped.blocks : existing.blocks,
      actions: mapped.actions?.length ? mapped.actions : existing.actions,
      streamingStatus: undefined,
    })
  }

  const ordered: UiMessage[] = []
  const usedKeys = new Set<string>()
  const seenIds = new Set<string>()

  const pushUnique = (message: UiMessage) => {
    if (seenIds.has(message.id)) {
      return
    }
    seenIds.add(message.id)
    ordered.push(message)
  }

  for (const message of localMessages) {
    const key = messageKey(message)
    const next = merged.get(key)
    if (next && !usedKeys.has(key)) {
      pushUnique(next)
      usedKeys.add(key)
    }
  }

  for (const serverMessage of serverMessages.filter(isVisibleSessionMessage)) {
    const mapped = mapSessionMessage(serverMessage)
    const key = messageKey(mapped)
    if (!usedKeys.has(key)) {
      pushUnique(merged.get(key) ?? mapped)
      usedKeys.add(key)
    }
  }

  return ordered
}
