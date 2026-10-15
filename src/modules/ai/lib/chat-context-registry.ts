import type { RegisteredChatContext } from "@/src/modules/ai/types/chat.types"

/**
 * One mounted consumer (a finance detail or a sheet over it) registers the
 * entity it is showing. The store keeps every registration and reveals the
 * newest one, so closing a sheet restores the screen below it.
 */
export type ChatContextRegistration = {
  id: string
  context: RegisteredChatContext | null
}

export function activeChatContext(
  registrations: readonly ChatContextRegistration[]
): RegisteredChatContext | null {
  for (let index = registrations.length - 1; index >= 0; index -= 1) {
    const context = registrations[index]?.context
    if (context) {
      return context
    }
  }
  return null
}

export function registerChatContext(
  registrations: readonly ChatContextRegistration[],
  registration: ChatContextRegistration
): ChatContextRegistration[] {
  return [
    ...registrations.filter((current) => current.id !== registration.id),
    registration,
  ]
}

export function unregisterChatContext(
  registrations: readonly ChatContextRegistration[],
  id: string
): ChatContextRegistration[] {
  return registrations.filter((current) => current.id !== id)
}
