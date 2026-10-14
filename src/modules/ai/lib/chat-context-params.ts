import {
  ENTITY_REF_TYPE_LABELS,
  parseEntityRefType,
  type ChatContext,
  type RegisteredChatContext,
} from "@/src/modules/ai/types/chat.types"

export const CHAT_CONTEXT_PARAM_KEYS = {
  module: "module",
  screen: "screen",
  entityType: "entityType",
  entityId: "entityId",
  entityLabel: "entityLabel",
} as const

export const DEFAULT_CHAT_MODULE = "general"

export function parseChatContextParams(
  params: URLSearchParams
): RegisteredChatContext {
  const context: RegisteredChatContext = {
    moduleSlug:
      params.get(CHAT_CONTEXT_PARAM_KEYS.module) ?? DEFAULT_CHAT_MODULE,
  }

  const screen = params.get(CHAT_CONTEXT_PARAM_KEYS.screen)
  if (screen) {
    context.screen = screen
  }

  const entityType = parseEntityRefType(
    params.get(CHAT_CONTEXT_PARAM_KEYS.entityType)
  )
  const entityId = params.get(CHAT_CONTEXT_PARAM_KEYS.entityId)
  if (entityType && entityId) {
    context.entityRef = { type: entityType, id: entityId }
  }

  const entityLabel = params.get(CHAT_CONTEXT_PARAM_KEYS.entityLabel)
  if (entityLabel) {
    context.entityLabel = entityLabel
  }

  return context
}

export function buildChatContextParams(
  context: RegisteredChatContext | null
): URLSearchParams {
  const params = new URLSearchParams()
  if (!context) {
    params.set(CHAT_CONTEXT_PARAM_KEYS.module, DEFAULT_CHAT_MODULE)
    return params
  }

  params.set(CHAT_CONTEXT_PARAM_KEYS.module, context.moduleSlug)
  if (context.screen) {
    params.set(CHAT_CONTEXT_PARAM_KEYS.screen, context.screen)
  }
  if (context.entityRef) {
    params.set(CHAT_CONTEXT_PARAM_KEYS.entityType, context.entityRef.type)
    params.set(CHAT_CONTEXT_PARAM_KEYS.entityId, context.entityRef.id)
  }
  if (context.entityLabel) {
    params.set(CHAT_CONTEXT_PARAM_KEYS.entityLabel, context.entityLabel)
  }

  return params
}

/** Drops the local label: the API contract only carries type and id. */
export function toWireChatContext(
  context: RegisteredChatContext | null | undefined
): ChatContext | null {
  if (!context) {
    return null
  }
  const wire: ChatContext = { moduleSlug: context.moduleSlug }
  if (context.screen) {
    wire.screen = context.screen
  }
  if (context.entityRef) {
    wire.entityRef = context.entityRef
  }
  return wire
}

export function chatContextLabel(
  context: RegisteredChatContext | null | undefined
): string | null {
  if (!context?.entityRef) {
    return null
  }
  return context.entityLabel ?? ENTITY_REF_TYPE_LABELS[context.entityRef.type]
}
