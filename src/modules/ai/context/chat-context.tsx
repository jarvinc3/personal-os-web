"use client"

import type {
  EntityRefType,
  RegisteredChatContext,
} from "@/src/modules/ai/types/chat.types"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ChatContextStore = {
  context: RegisteredChatContext | null
  setContext: (context: RegisteredChatContext | null) => void
}

const ChatContextStoreContext = createContext<ChatContextStore | null>(null)

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<RegisteredChatContext | null>(
    null
  )

  const setContext = useCallback((next: RegisteredChatContext | null) => {
    setContextState(next)
  }, [])

  const value = useMemo(() => ({ context, setContext }), [context, setContext])

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
 * A finance detail registers the entity it is showing. The value is cleared on
 * unmount so the launcher never opens the chat with a stale entity.
 */
export function useRegisterChatContext(context: RegisteredChatContext | null) {
  const store = useContext(ChatContextStoreContext)
  const setContext = store?.setContext

  const moduleSlug = context?.moduleSlug ?? null
  const screen = context?.screen ?? null
  const entityType: EntityRefType | null = context?.entityRef?.type ?? null
  const entityId = context?.entityRef?.id ?? null
  const entityLabel = context?.entityLabel ?? null

  useEffect(() => {
    if (!setContext) {
      return
    }
    if (!moduleSlug) {
      setContext(null)
      return
    }

    setContext({
      moduleSlug,
      screen: screen ?? undefined,
      entityRef:
        entityType && entityId ? { type: entityType, id: entityId } : undefined,
      entityLabel: entityLabel ?? undefined,
    })

    return () => setContext(null)
  }, [setContext, moduleSlug, screen, entityType, entityId, entityLabel])
}
