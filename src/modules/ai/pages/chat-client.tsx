"use client"

import { ChatEmptySuggestions } from "@/src/modules/ai/components/chat-empty-suggestions";
import { ChatInput } from "@/src/modules/ai/components/chat-input";
import { ChatMessageRenderer } from "@/src/modules/ai/components/chat-message-renderer";
import { ChatSessionSheet } from "@/src/modules/ai/components/chat-session-sheet";
import { useAiChat } from "@/src/modules/ai/hooks/use-ai-chat";
import {
  useAiSession,
  useCreateAiSession,
} from "@/src/modules/ai/hooks/use-ai-sessions";
import {
  getUiMessageKey,
  mergeSessionMessages,
  type UiMessage,
} from "@/src/modules/ai/lib/merge-session-messages";
import {
  CHAT_MODULE_OPTIONS,
  parseModuleChatSlug,
  type AiActionSummary,
  type AiSessionSummary,
  type ModuleChatSlug,
} from "@/src/modules/ai/types/chat.types";
import { useAuthGuard } from "@/src/modules/auth";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { Button } from "@/src/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { appToast } from "@/src/shared/lib/app-toast";
import { HistoryIcon, PlusCircleIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function parseModuleParam(value: string | null): ModuleChatSlug {
  return parseModuleChatSlug(value)
}

function parseSessionIdParam(value: string | null): string | null {
  return value && value.length > 0 ? value : null
}

function parsePromptParam(value: string | null): string | null {
  return value && value.trim().length > 0 ? value.trim() : null
}

export function ChatClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuthGuard()
  const createSessionMutation = useCreateAiSession()

  const [sessionId, setSessionId] = useState<string | null>(
    parseSessionIdParam(searchParams.get("sessionId"))
  )
  const [moduleSlug, setModuleSlug] = useState<ModuleChatSlug>(
    parseModuleParam(searchParams.get("module"))
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

  const syncModuleContext = useCallback(
    (slug: ModuleChatSlug) => {
      setModuleSlug(slug)
      const params = new URLSearchParams(searchParams.toString())
      params.set("module", slug)
      router.replace(`${APP_ROUTES.app.chat}?${params.toString()}`)
    },
    [router, searchParams]
  )

  const chatMutation = useAiChat((slug) => {
    syncModuleContext(slug)
  })

  const sessionQuery = useAiSession(sessionId)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

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
    const moduleParam = searchParams.get("module")
    if (moduleParam) {
      // Keep local selection aligned with browser back/forward navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModuleSlug(parseModuleParam(moduleParam))
    }
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
      setModuleSlug(sessionModule)
    }

    setLocalMessages((prev) =>
      mergeSessionMessages(prev, sessionQuery.data.messages)
    )
  }, [
    sessionQuery.data?.messages,
    sessionQuery.data?.moduleSlug,
    moduleSlug,
  ])

  const displayMessages = useMemo(() => localMessages, [localMessages])

  const scrollToEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const updateUrlParams = useCallback(
    (patch: {
      sessionId?: string | null
      module?: ModuleChatSlug
      prompt?: string
    }) => {
      const params = new URLSearchParams()
      const moduleValue = patch.module ?? moduleSlug
      params.set("module", moduleValue)

      if (patch.sessionId) {
        params.set("sessionId", patch.sessionId)
      }

      if (patch.prompt) {
        params.set("prompt", patch.prompt)
      }

      router.replace(`${APP_ROUTES.app.chat}?${params.toString()}`)
    },
    [router, moduleSlug]
  )

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
    const params = new URLSearchParams()
    params.set("module", moduleSlug)
    router.replace(`${APP_ROUTES.app.chat}?${params.toString()}`)
  }, [moduleSlug, router])

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
    setSessionId(session.id)
    setModuleSlug((session.moduleSlug as ModuleChatSlug) ?? "general")
    updateUrlParams({
      sessionId: session.id,
      module: (session.moduleSlug as ModuleChatSlug) ?? "general",
    })
  }

  const handleModuleChange = useCallback(
    (slug: ModuleChatSlug) => {
      setModuleSlug(slug)
      updateUrlParams({ module: slug })
    },
    [updateUrlParams]
  )

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
          })
          activeSessionId = session.id
          setSessionId(activeSessionId)
          updateUrlParams({ sessionId: activeSessionId, module: moduleSlug })
        }

        const response = await chatMutation.mutateAsync({
          sessionId: activeSessionId,
          messages: [{ role: "user", content: text }],
          clientMessageId,
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
                m.id === assistantId
                  ? { ...m, streamingStatus: message }
                  : m
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
            if (m.clientMessageId !== clientMessageId || m.role !== "assistant") {
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
      chatMutation,
      createSessionMutation,
      scrollToEnd,
      syncModuleContext,
      updateUrlParams,
    ]
  )

  useEffect(() => {
    const prompt = parsePromptParam(searchParams.get("prompt"))
    if (!prompt) return
    pendingPromptRef.current = prompt
    promptSentRef.current = false
  }, [searchParams])

  useEffect(() => {
    if (promptSentRef.current || !pendingPromptRef.current) return
    if (chatMutation.isPending || createSessionMutation.isPending) return
    if (sessionId && sessionQuery.isLoading) return

    const prompt = pendingPromptRef.current
    promptSentRef.current = true
    pendingPromptRef.current = null
    updateUrlParams({ prompt: "" })
    void sendMessage(prompt)
  }, [
    sessionId,
    sessionQuery.isLoading,
    chatMutation.isPending,
    createSessionMutation.isPending,
    sendMessage,
    searchParams,
    updateUrlParams,
  ])

  useEffect(() => {
    scrollToEnd()
  }, [displayMessages.length, scrollToEnd])

  const headerTitle = useMemo(
    () => (
      <Select value={moduleSlug} onValueChange={(value) => handleModuleChange(value as ModuleChatSlug)}>
        <SelectTrigger className="text-lg font-bold tracking-tight capitalize bg-transparent border-none cursor-pointer w-fit">
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
    [moduleSlug, handleModuleChange]
  )

  const headerActions = useMemo(
    () => (
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSessionsOpen(true)}
          aria-label="Historial de conversaciones"
          className="rounded-full size-9"
        >
          <HistoryIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => void handleNewChat()}
          aria-label="Nueva conversación"
          className="rounded-full size-9"
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

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  if (isLoadingExistingSession) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height))] flex-col">
      <div className="overflow-y-auto scrollbar-hide flex-1 px-3 py-2">
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
