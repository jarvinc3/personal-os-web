"use client"

import { ChatEmptySuggestions } from "@/src/modules/ai/components/chat-empty-suggestions"
import { ChatInput } from "@/src/modules/ai/components/chat-input"
import { ChatMessageRenderer } from "@/src/modules/ai/components/chat-message-renderer"
import { ChatSessionSheet } from "@/src/modules/ai/components/chat-session-sheet"
import { useAiChat } from "@/src/modules/ai/hooks/use-ai-chat"
import {
  useAiSession,
  useCreateAiSession,
} from "@/src/modules/ai/hooks/use-ai-sessions"
import {
  buildChatContextParams,
  chatContextLabel,
  parseChatContextParams,
  toWireChatContext,
} from "@/src/modules/ai/lib/chat-context-params"
import {
  getUiMessageKey,
  mergeSessionMessages,
  type UiMessage,
} from "@/src/modules/ai/lib/merge-session-messages"
import {
  CHAT_MODULE_OPTIONS,
  parseModuleChatSlug,
  type AiActionSummary,
  type AiSessionSummary,
  type ModuleChatSlug,
  type RegisteredChatContext,
} from "@/src/modules/ai/types/chat.types"
import { AiGate } from "@/src/modules/ai/ai-gate"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import { BotIcon, HistoryIcon, PlusCircleIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"

function parseSessionIdParam(value: string | null): string | null {
  return value && value.length > 0 ? value : null
}

function parsePromptParam(value: string | null): string | null {
  return value && value.trim().length > 0 ? value.trim() : null
}

function sameChatContext(
  a: RegisteredChatContext,
  b: RegisteredChatContext
): boolean {
  return (
    a.moduleSlug === b.moduleSlug &&
    a.screen === b.screen &&
    a.entityLabel === b.entityLabel &&
    a.entityRef?.type === b.entityRef?.type &&
    a.entityRef?.id === b.entityRef?.id
  )
}

export function ChatScreen() {
  return (
    <AiGate>
      <ChatScreenBody />
    </AiGate>
  )
}

function ChatScreenBody() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createSessionMutation = useCreateAiSession()

  const [sessionId, setSessionId] = useState<string | null>(
    parseSessionIdParam(searchParams.get("sessionId"))
  )
  const [chatContext, setChatContext] = useState<RegisteredChatContext>(() =>
    parseChatContextParams(new URLSearchParams(searchParams.toString()))
  )
  const [draft, setDraft] = useState("")
  const [localMessages, setLocalMessages] = useState<UiMessage[]>([])
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const isSendingRef = useRef(false)
  const pendingPromptRef = useRef<string | null>(
    parsePromptParam(searchParams.get("prompt"))
  )
  const promptSentRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamFrameRef = useRef<number | null>(null)
  const pendingStreamContentRef = useRef<string | null>(null)

  const moduleSlug = useMemo(
    () => parseModuleChatSlug(chatContext.moduleSlug),
    [chatContext.moduleSlug]
  )
  const contextLabel = chatContextLabel(chatContext)
  const wireContext = useMemo(
    () => toWireChatContext(chatContext),
    [chatContext]
  )

  const writeUrl = useCallback(
    (patch: {
      sessionId?: string | null
      prompt?: string
      context?: RegisteredChatContext
    }) => {
      const params = buildChatContextParams(patch.context ?? chatContext)
      const nextSessionId =
        patch.sessionId === undefined ? sessionId : patch.sessionId
      if (nextSessionId) {
        params.set("sessionId", nextSessionId)
      }
      if (patch.prompt) {
        params.set("prompt", patch.prompt)
      }
      router.replace(`${APP_ROUTES.app.chat}?${params.toString()}`)
    },
    [router, chatContext, sessionId]
  )

  const syncModuleContext = useCallback(
    (slug: ModuleChatSlug) => {
      if (chatContext.moduleSlug === slug) {
        return
      }
      const next: RegisteredChatContext = { moduleSlug: slug }
      setChatContext(next)
      writeUrl({ context: next })
    },
    [chatContext.moduleSlug, writeUrl]
  )

  const chatMutation = useAiChat((slug) => {
    syncModuleContext(slug)
  })

  const sessionQuery = useAiSession(sessionId)

  useEffect(() => {
    const fromParams = parseSessionIdParam(searchParams.get("sessionId"))
    // URL navigation is an external source that must reset the optimistic chat state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(fromParams)
    if (!fromParams && !isSendingRef.current) {
      setLocalMessages([])
    }
  }, [searchParams])

  useEffect(() => {
    const fromUrl = parseChatContextParams(
      new URLSearchParams(searchParams.toString())
    )
    // URL navigation is an external source for the chip context.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChatContext((prev) => (sameChatContext(prev, fromUrl) ? prev : fromUrl))
  }, [searchParams])

  useEffect(() => {
    if (isSendingRef.current || !sessionQuery.data?.messages) {
      return
    }

    const sessionModule = sessionQuery.data.moduleSlug
      ? parseModuleChatSlug(sessionQuery.data.moduleSlug)
      : null
    if (sessionModule && sessionModule !== moduleSlug) {
      // The persisted session context is authoritative after the query resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      syncModuleContext(sessionModule)
    }

    setLocalMessages((prev) =>
      mergeSessionMessages(prev, sessionQuery.data.messages)
    )
  }, [
    sessionQuery.data?.messages,
    sessionQuery.data?.moduleSlug,
    moduleSlug,
    syncModuleContext,
  ])

  const displayMessages = useMemo(() => localMessages, [localMessages])

  const scrollToEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleNewChat = useCallback(() => {
    isSendingRef.current = false
    promptSentRef.current = false
    pendingPromptRef.current = null
    pendingStreamContentRef.current = null
    if (streamFrameRef.current !== null) {
      cancelAnimationFrame(streamFrameRef.current)
      streamFrameRef.current = null
    }
    setSessionId(null)
    setLocalMessages([])
    setDraft("")
    writeUrl({ sessionId: null })
  }, [writeUrl])

  const handleActionUpdated = useCallback((updatedAction: AiActionSummary) => {
    setLocalMessages((prev) =>
      prev.map((message) => {
        const hasAction =
          message.actions?.some((action) => action.id === updatedAction.id) ||
          message.blocks?.some(
            (block) =>
              block.type === "action" && block.action.id === updatedAction.id
          )

        if (!hasAction) {
          return message
        }

        return {
          ...message,
          actions: message.actions?.map((action) =>
            action.id === updatedAction.id ? updatedAction : action
          ),
          blocks: message.blocks?.map((block) =>
            block.type === "action" && block.action.id === updatedAction.id
              ? { ...block, action: updatedAction }
              : block
          ),
        }
      })
    )
  }, [])

  const handleSelectSession = (session: AiSessionSummary) => {
    const storedContext = session.chatContext
    const nextContext: RegisteredChatContext = storedContext
      ? {
          moduleSlug:
            storedContext.moduleSlug ?? session.moduleSlug ?? "general",
          screen: storedContext.screen,
          entityRef: storedContext.entityRef,
        }
      : { moduleSlug: (session.moduleSlug as ModuleChatSlug) ?? "general" }
    setSessionId(session.id)
    setChatContext(nextContext)
    writeUrl({ sessionId: session.id, context: nextContext })
  }

  const handleClearContext = useCallback(() => {
    const next: RegisteredChatContext = { moduleSlug: chatContext.moduleSlug }
    setChatContext(next)
    writeUrl({ context: next })
  }, [chatContext.moduleSlug, writeUrl])

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? draft).trim()
      if (
        !text ||
        isSendingRef.current ||
        chatMutation.isPending ||
        createSessionMutation.isPending
      ) {
        return
      }

      isSendingRef.current = true

      let activeSessionId = sessionId
      const clientMessageId = uuidv4()
      const userMessage: UiMessage = {
        id: `local-user-${clientMessageId}`,
        role: "user",
        content: text,
        clientMessageId,
      }
      const assistantId = `local-assistant-${clientMessageId}`

      if (!textOverride) {
        setDraft("")
      }

      setLocalMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          clientMessageId,
        },
      ])

      const flushStreamContent = (content: string) => {
        pendingStreamContentRef.current = content
        if (streamFrameRef.current !== null) {
          return
        }
        streamFrameRef.current = requestAnimationFrame(() => {
          streamFrameRef.current = null
          const nextContent = pendingStreamContentRef.current
          if (nextContent === null) {
            return
          }
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: nextContent, streamingStatus: undefined }
                : m
            )
          )
          scrollToEnd()
        })
      }

      try {
        if (!activeSessionId) {
          const session = await createSessionMutation.mutateAsync({
            moduleSlug,
            context: wireContext,
          })
          activeSessionId = session.id
          setSessionId(activeSessionId)
          writeUrl({ sessionId: activeSessionId })
        }

        const response = await chatMutation.mutateAsync({
          sessionId: activeSessionId,
          messages: [{ role: "user", content: text }],
          clientMessageId,
          context: wireContext,
          onStreamStart: (meta) => {
            setSessionId(meta.sessionId)
            if (meta.moduleSlug) {
              syncModuleContext(meta.moduleSlug)
            }
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      moduleLabel: meta.moduleLabel,
                      provider: meta.provider,
                      model: meta.model,
                    }
                  : m
              )
            )
          },
          onModuleContext: syncModuleContext,
          onStreamStatus: (message) => {
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, streamingStatus: message } : m
              )
            )
          },
          onStreamChunk: (content) => {
            flushStreamContent(content)
          },
        })

        if (streamFrameRef.current !== null) {
          cancelAnimationFrame(streamFrameRef.current)
          streamFrameRef.current = null
        }
        pendingStreamContentRef.current = null

        setSessionId(response.sessionId)
        setLocalMessages((prev) =>
          prev.map((m) => {
            if (
              m.clientMessageId !== clientMessageId ||
              m.role !== "assistant"
            ) {
              return m
            }

            const nextContent =
              response.content.trim().length >= m.content.trim().length
                ? response.content
                : m.content

            return {
              ...m,
              content: nextContent,
              actions: response.actions,
              blocks: response.blocks,
              moduleLabel: response.moduleLabel,
              provider: response.provider,
              model: response.model,
              streamingStatus: undefined,
            }
          })
        )
      } catch (error) {
        if (streamFrameRef.current !== null) {
          cancelAnimationFrame(streamFrameRef.current)
          streamFrameRef.current = null
        }
        pendingStreamContentRef.current = null
        setLocalMessages((prev) =>
          prev.filter((m) => m.clientMessageId !== clientMessageId)
        )
        appToast.error({
          text1: "No se pudo enviar el mensaje",
          text2: error instanceof Error ? error.message : "Error desconocido",
        })
      } finally {
        isSendingRef.current = false
      }
    },
    [
      draft,
      sessionId,
      moduleSlug,
      wireContext,
      chatMutation,
      createSessionMutation,
      scrollToEnd,
      syncModuleContext,
      writeUrl,
    ]
  )

  useEffect(() => {
    const prompt = parsePromptParam(searchParams.get("prompt"))
    if (!prompt) {
      return
    }
    pendingPromptRef.current = prompt
    promptSentRef.current = false
  }, [searchParams])

  useEffect(() => {
    if (promptSentRef.current || !pendingPromptRef.current) {
      return
    }
    if (chatMutation.isPending || createSessionMutation.isPending) {
      return
    }
    if (sessionId && sessionQuery.isLoading) {
      return
    }

    const prompt = pendingPromptRef.current
    promptSentRef.current = true
    pendingPromptRef.current = null
    writeUrl({ prompt: "" })
    void sendMessage(prompt)
  }, [
    sessionId,
    sessionQuery.isLoading,
    chatMutation.isPending,
    createSessionMutation.isPending,
    sendMessage,
    searchParams,
    writeUrl,
  ])

  useEffect(() => {
    scrollToEnd()
  }, [displayMessages.length, scrollToEnd])

  const headerTitle = useMemo(
    () => (
      <Select
        value={moduleSlug}
        onValueChange={(value) => syncModuleContext(value as ModuleChatSlug)}
      >
        <SelectTrigger className="w-fit cursor-pointer border-none bg-transparent text-lg font-bold tracking-tight capitalize">
          <BotIcon className="size-4 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-48">
          <SelectGroup>
            <SelectLabel>Contexto del agente</SelectLabel>
            {CHAT_MODULE_OPTIONS.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ),
    [moduleSlug, syncModuleContext]
  )

  const headerActions = useMemo(
    () => (
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSessionsOpen(true)}
          aria-label="Historial de conversaciones"
          className="size-9 rounded-full"
        >
          <HistoryIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => void handleNewChat()}
          aria-label="Nueva conversación"
          className="size-9 rounded-full"
        >
          <PlusCircleIcon />
        </Button>
      </>
    ),
    [handleNewChat]
  )

  usePageHeader(
    {
      title: headerTitle,
      actions: headerActions,
      showNotificationBell: false,
    },
    [headerTitle, headerActions]
  )

  const isLoadingExistingSession =
    Boolean(sessionId) &&
    sessionQuery.isLoading &&
    displayMessages.length === 0 &&
    !chatMutation.isPending

  if (isLoadingExistingSession) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height))] flex-col">
      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-2">
        {displayMessages.length === 0 ? (
          <ChatEmptySuggestions
            moduleSlug={moduleSlug}
            disabled={chatMutation.isPending || createSessionMutation.isPending}
            onSelect={(prompt) => void sendMessage(prompt)}
          />
        ) : (
          <div className="flex flex-col">
            {displayMessages.map((item) => (
              <ChatMessageRenderer
                key={getUiMessageKey(item)}
                role={item.role}
                content={item.content || ""}
                blocks={item.blocks}
                actions={item.actions}
                moduleLabel={item.moduleLabel}
                provider={item.provider}
                model={item.model}
                sessionId={sessionId}
                streamingStatus={item.streamingStatus}
                onActionUpdated={handleActionUpdated}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={() => void sendMessage()}
        disabled={chatMutation.isPending || createSessionMutation.isPending}
        contextLabel={contextLabel}
        onClearContext={handleClearContext}
      />

      <ChatSessionSheet
        open={sessionsOpen}
        onOpenChange={setSessionsOpen}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={() => void handleNewChat()}
      />
    </div>
  )
}
