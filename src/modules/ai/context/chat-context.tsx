"use client"

import {
  activeChatContext,
  registerChatContext,
  unregisterChatContext,
  type ChatContextRegistration,
} from "@/src/modules/ai/lib/chat-context-registry"
import type {
  EntityRefType,
  RegisteredChatContext,
} from "@/src/modules/ai/types/chat.types"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ChatContextStore = {
  context: RegisteredChatContext | null
  register: (registration: ChatContextRegistration) => void
  unregister: (id: string) => void
}

const ChatContextStoreContext = createContext<ChatContextStore | null>(null)

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<ChatContextRegistration[]>(
    []
  )

  const register = useCallback((registration: ChatContextRegistration) => {
    setRegistrations((current) => registerChatContext(current, registration))
  }, [])

  const unregister = useCallback((id: string) => {
    setRegistrations((current) => unregisterChatContext(current, id))
  }, [])

  const context = useMemo(
    () => activeChatContext(registrations),
    [registrations]
  )

  const value = useMemo(
    () => ({ context, register, unregister }),
    [context, register, unregister]
  )

  return (
    <ChatContextStoreContext.Provider value={value}>
      {children}
    </ChatContextStoreContext.Provider>
  )
}

export function useChatContext(): RegisteredChatContext | null {
  return useContext(ChatContextStoreContext)?.context ?? null
}

/**
 * A finance detail registers the entity it is showing; a sheet over it
 * registers a narrower one. The last registration wins and unmounting it
 * reveals the screen below, so the launcher never opens with a stale entity.
 */
export function useRegisterChatContext(context: RegisteredChatContext | null) {
  const store = useContext(ChatContextStoreContext)
  const registrationId = useId()
  const register = store?.register
  const unregister = store?.unregister

  const moduleSlug = context?.moduleSlug ?? null
  const screen = context?.screen ?? null
  const entityType: EntityRefType | null = context?.entityRef?.type ?? null
  const entityId = context?.entityRef?.id ?? null
  const entityLabel = context?.entityLabel ?? null

  useEffect(() => {
    if (!register || !unregister) {
      return
    }

    register({
      id: registrationId,
      context: moduleSlug
        ? {
            moduleSlug,
            screen: screen ?? undefined,
            entityRef:
              entityType && entityId
                ? { type: entityType, id: entityId }
                : undefined,
            entityLabel: entityLabel ?? undefined,
          }
        : null,
    })

    return () => unregister(registrationId)
  }, [
    register,
    unregister,
    registrationId,
    moduleSlug,
    screen,
    entityType,
    entityId,
    entityLabel,
  ])
}
