"use client"

import {
  HistoryIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react"

import { AgentChatComposer } from "@/src/modules/intelligence/components/agent-chat-composer"
import { AgentChatHistorySheet } from "@/src/modules/intelligence/components/agent-chat-history-sheet"
import { AgentChatMessage } from "@/src/modules/intelligence/components/agent-chat-message"
import { ViewSuggestionsRow } from "@/src/modules/intelligence/components/view-suggestions-row"
import {
  useAgentConversation,
  useCreateAgentConversation,
  useLatestAgentConversation,
  useSendAgentMessage,
} from "@/src/modules/intelligence/hooks/use-agent-chat"
import {
  useDismissViewSuggestion,
  useViewSuggestions,
} from "@/src/modules/intelligence/hooks/use-view-suggestions"
import { agentContextLabel } from "@/src/modules/intelligence/lib/agent-chat-context"
import { viewSuggestionScopeFromContext } from "@/src/modules/intelligence/lib/view-suggestions"
import type {
  AgentChatUiMessage,
  AgentConversationDetail,
  AgentConversationSummary,
  AgentInvocationContext,
} from "@/src/modules/intelligence/types/agent-chat.types"
import type { ViewSuggestion } from "@/src/modules/intelligence/types/view-suggestions.types"
import { AGENT_CHAT_HISTORY_PICKER } from "@/src/modules/intelligence/constants/agent-chat"
import { useTabBarVisible } from "@/src/shared/context/tab-bar-context"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { cn } from "@/src/shared/lib/utils"

const PULL_CLOSE_DISTANCE = 72
const PULL_MAX_DISTANCE = 120
const NO_VIEW_SUGGESTIONS: ViewSuggestion[] = []

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

function toUiMessages(
  messages: AgentConversationDetail["messages"]
): AgentChatUiMessage[] {
  return messages.flatMap((message, index) => {
    if (message.role !== "user" && message.role !== "assistant") {
      return []
    }
    return [
      {
        id: `${message.role}-${index}-${message.createdAt}`,
        role: message.role,
        content: message.content,
        status: "done" as const,
      },
    ]
  })
}

export function AgentChatOverlay({
  conversationId,
  initialContext,
  suggestionId,
  onSuggestionConsumed,
  onSelectConversation,
  onNewChat,
  onClose,
}: {
  conversationId: string | null
  initialContext: AgentInvocationContext
  suggestionId: string | null
  onSuggestionConsumed: () => void
  onSelectConversation: (conversationId: string) => void
  onNewChat: () => void
  onClose: () => void
}) {
  const tabBarVisible = useTabBarVisible()
  const conversationQuery = useAgentConversation(conversationId)
  const createConversation = useCreateAgentConversation()
  const sendMessage = useSendAgentMessage()
  const [newChat, setNewChat] = useState(false)
  const latestQuery = useLatestAgentConversation(
    initialContext,
    !conversationId && !newChat
  )
  const history = usePicker<"none" | typeof AGENT_CHAT_HISTORY_PICKER>("none")

  const activeConversation =
    conversationQuery.data ??
    (conversationId ? null : (latestQuery.data?.conversation ?? null))
  const activeConversationId = activeConversation?.id ?? null
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null)
  const isNewConversation =
    newChat ||
    (!activeConversationId && !pendingConversationId && !activeConversation)
  const [messages, setMessages] = useState<AgentChatUiMessage[]>([])
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [retry, setRetry] = useState<{
    text: string
    clientMessageId: string
    assistantId: string
  } | null>(null)
  const [contextEnabled, setContextEnabled] = useState(true)
  const [pullDistance, setPullDistance] = useState(0)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null)
  const [dismissTarget, setDismissTarget] = useState<ViewSuggestion | null>(
    null
  )
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const loadedIdRef = useRef<string | null>(null)
  const touchStartRef = useRef<number | null>(null)
  const pullDistanceRef = useRef(0)
  const stickToBottomRef = useRef(true)
  const consumedSuggestionRef = useRef<string | null>(null)
  const suggestionScope = useMemo(
    () => viewSuggestionScopeFromContext(initialContext),
    [initialContext]
  )
  const suggestionsQuery = useViewSuggestions(suggestionScope, true)
  const suggestions = suggestionsQuery.data?.suggestions ?? NO_VIEW_SUGGESTIONS
  const dismissSuggestion = useDismissViewSuggestion()

  const historyOpen = history.picker === AGENT_CHAT_HISTORY_PICKER
  const secondaryModalOpen = historyOpen || dismissTarget !== null
  const isLoadingConversation =
    Boolean(conversationId) &&
    conversationQuery.isPending &&
    messages.length === 0
  const isLoadingLatest =
    !conversationId &&
    !newChat &&
    latestQuery.isPending &&
    messages.length === 0

  useEffect(() => {
    if (!activeConversation || pending) {
      return
    }
    if (loadedIdRef.current === activeConversation.id) {
      return
    }
    loadedIdRef.current = activeConversation.id
    setMessages(toUiMessages(activeConversation.messages))
    setContextEnabled(Boolean(activeConversation.context))
    setNewChat(false)
  }, [activeConversation, pending])

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (stickToBottomRef.current) {
      endRef.current?.scrollIntoView({ block: "end" })
    }
  }, [messages])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (secondaryModalOpen) {
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab") {
        return
      }
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables?.length) {
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [secondaryModalOpen, onClose])

  useEffect(() => {
    if (!suggestionId || consumedSuggestionRef.current === suggestionId) {
      return
    }
    if (suggestionsQuery.isPending) {
      return
    }
    const suggestion = suggestions.find((item) => item.id === suggestionId)
    if (suggestion) {
      // La sugerencia llega por la URL y se resuelve cuando carga la query.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft((current) =>
        current.trim().length > 0 ? current : suggestion.prompt
      )
      setSelectedSuggestionId(suggestion.id)
    }
    consumedSuggestionRef.current = suggestionId
    onSuggestionConsumed()
  }, [
    suggestionId,
    suggestions,
    suggestionsQuery.isPending,
    onSuggestionConsumed,
  ])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const contextLabel = contextEnabled
    ? agentContextLabel(initialContext)
    : "Sin contexto"
  const showContextToggle =
    isNewConversation && !pending && !isLoadingConversation && !isLoadingLatest
  const activeSendContext = contextEnabled ? initialContext : null

  const updateAssistant = useCallback(
    (assistantId: string, update: Partial<AgentChatUiMessage>) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, ...update } : message
        )
      )
    },
    []
  )

  const streamTurn = useCallback(
    async ({
      text,
      clientMessageId,
      assistantId,
      context,
    }: {
      text: string
      clientMessageId: string
      assistantId: string
      context: AgentInvocationContext | null
    }) => {
      const controller = new AbortController()
      abortRef.current?.abort()
      abortRef.current = controller
      setPending(true)
      setPendingStatus("Pensando…")
      setRetry(null)
      let conversation = activeConversationId ?? pendingConversationId
      try {
        if (!conversation) {
          const created = await createConversation.mutateAsync(context)
          conversation = created.id
          setPendingConversationId(created.id)
          loadedIdRef.current = created.id
          onSelectConversation(created.id)
        }
        await sendMessage.mutateAsync({
          conversationId: conversation,
          content: text,
          clientMessageId,
          context,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === "status") {
              setPendingStatus(event.message)
              return
            }
            if (event.type === "reset") {
              updateAssistant(assistantId, { content: "" })
              return
            }
            if (event.type === "chunk") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        content: message.content + event.content,
                        status: "streaming",
                      }
                    : message
                )
              )
              return
            }
            if (event.type === "done") {
              updateAssistant(assistantId, {
                content: event.answer,
                status: "done",
                provider: event.provider,
                model: event.model,
              })
            }
          },
        })
        setPendingStatus(null)
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) {
          return
        }
        updateAssistant(assistantId, { status: "error" })
        setRetry({ text, clientMessageId, assistantId })
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
        }
        setPending(false)
        setPendingStatus(null)
      }
    },
    [
      activeConversationId,
      createConversation,
      pendingConversationId,
      onSelectConversation,
      sendMessage,
      updateAssistant,
    ]
  )

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text || pending) {
      return
    }
    const clientMessageId = crypto.randomUUID()
    const assistantId = `assistant-${clientMessageId}`
    stickToBottomRef.current = true
    setDraft("")
    setMessages((current) => [
      ...current,
      {
        id: `user-${clientMessageId}`,
        role: "user",
        content: text,
        status: "done",
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
        clientMessageId,
      },
    ])
    void streamTurn({
      text,
      clientMessageId,
      assistantId,
      context: activeSendContext,
    })
  }, [activeSendContext, draft, pending, streamTurn])

  const handleRetry = useCallback(() => {
    if (!retry || pending) {
      return
    }
    stickToBottomRef.current = true
    updateAssistant(retry.assistantId, { content: "", status: "streaming" })
    void streamTurn({
      text: retry.text,
      clientMessageId: retry.clientMessageId,
      assistantId: retry.assistantId,
      context: activeSendContext,
    })
  }, [activeSendContext, pending, retry, streamTurn, updateAssistant])

  const handleSelectConversation = useCallback(
    (conversation: AgentConversationSummary) => {
      if (conversation.id === conversationId) {
        history.closeHandlerFor(AGENT_CHAT_HISTORY_PICKER)(false)
        return
      }
      abortRef.current?.abort()
      loadedIdRef.current = null
      setPendingConversationId(null)
      setMessages([])
      stickToBottomRef.current = true
      setNewChat(false)
      onSelectConversation(conversation.id)
    },
    [conversationId, history, onSelectConversation]
  )

  const confirmDismissSuggestion = useCallback(async () => {
    if (!dismissTarget) {
      return
    }
    try {
      await dismissSuggestion.mutateAsync(dismissTarget.id)
      setDismissTarget(null)
      if (selectedSuggestionId === dismissTarget.id) {
        setSelectedSuggestionId(null)
      }
    } catch {
      // El hook muestra el error y deja el diálogo abierto para reintentar.
    }
  }, [dismissSuggestion, dismissTarget, selectedSuggestionId])

  const handleSelectSuggestion = useCallback((suggestion: ViewSuggestion) => {
    setDraft(suggestion.prompt)
    setSelectedSuggestionId(suggestion.id)
    inputRef.current?.focus()
  }, [])

  const handleNewChat = useCallback(() => {
    const alreadyNew = !conversationId
    abortRef.current?.abort()
    loadedIdRef.current = null
    setPendingConversationId(null)
    setMessages([])
    stickToBottomRef.current = true
    setDraft("")
    setRetry(null)
    setContextEnabled(true)
    setSelectedSuggestionId(null)
    setDismissTarget(null)
    setNewChat(true)
    onNewChat()
    if (alreadyNew) {
      history.closeHandlerFor(AGENT_CHAT_HISTORY_PICKER)(false)
    }
  }, [conversationId, history, onNewChat])

  const handleListScroll = () => {
    const list = listRef.current
    if (!list) {
      return
    }
    stickToBottomRef.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < 120
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (listRef.current?.scrollTop !== 0 || pending) {
      return
    }
    touchStartRef.current = event.touches[0]?.clientY ?? null
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    if (start === null) {
      return
    }
    const delta = (event.touches[0]?.clientY ?? start) - start
    if (delta <= 0) {
      pullDistanceRef.current = 0
      setPullDistance(0)
      return
    }
    const next = Math.min(delta, PULL_MAX_DISTANCE)
    pullDistanceRef.current = next
    setPullDistance(next)
  }

  const handleTouchEnd = () => {
    if (pullDistanceRef.current >= PULL_CLOSE_DISTANCE) {
      onClose()
    }
    pullDistanceRef.current = 0
    touchStartRef.current = null
    setPullDistance(0)
  }

  const showInitialLoading = isLoadingConversation || isLoadingLatest
  const title =
    activeConversation?.title &&
    activeConversation.title !== "Nueva conversación"
      ? activeConversation.title
      : "Agente"

  return (
    <>
      <div
        className="agent-chat-backdrop fixed inset-0 z-80 animate-in bg-background/60 backdrop-blur-md duration-200 fade-in motion-reduce:animate-none motion-reduce:backdrop-blur-none"
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chat con el agente"
        className="agent-chat-panel fixed inset-0 z-90 flex animate-in flex-col bg-background/80 backdrop-blur-xl duration-200 fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
      >
        <header className="flex items-start gap-2 border-b border-border px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar el chat"
            onClick={onClose}
            className="mt-0.5 shrink-0"
          >
            <XIcon />
          </Button>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <div className="flex min-w-0 items-center gap-1">
              <Badge variant="secondary" className="max-w-[55vw] min-w-0">
                <SparklesIcon />
                <span className="truncate">{contextLabel}</span>
              </Badge>
              {showContextToggle ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={
                    contextEnabled ? "Quitar contexto" : "Usar contexto"
                  }
                  onClick={() => setContextEnabled((current) => !current)}
                >
                  {contextEnabled ? <XIcon /> : <PlusIcon />}
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Historial de conversaciones"
              onClick={() => history.openPicker(AGENT_CHAT_HISTORY_PICKER)}
            >
              <HistoryIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Nuevo chat"
              disabled={pending}
              onClick={handleNewChat}
            >
              <PlusIcon />
            </Button>
          </div>
        </header>

        <div
          ref={listRef}
          role="log"
          aria-label="Mensajes de la conversación"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-3"
          onScroll={handleListScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="mx-auto flex w-full max-w-3xl flex-col gap-3"
            style={{ paddingTop: pullDistance }}
          >
            {pullDistance > 0 ? (
              <p className="text-center text-xs text-muted-foreground">
                {pullDistance >= PULL_CLOSE_DISTANCE
                  ? "Suelta para cerrar"
                  : "Desliza para cerrar"}
              </p>
            ) : null}

            {showInitialLoading ? (
              <div className="flex flex-1 items-center justify-center py-16">
                <Spinner className="size-5" />
              </div>
            ) : conversationQuery.isError || latestQuery.isError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No se pudo cargar la conversación.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void conversationQuery.refetch()
                    void latestQuery.refetch()
                  }}
                >
                  Reintentar
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <Badge variant="secondary">
                  <SparklesIcon />
                  Agente
                </Badge>
                <div className="flex max-w-sm flex-col gap-1">
                  <p className="text-base font-medium">
                    Pregunta sobre lo que estás viendo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    El agente recibe la ruta, la vista o el sheet y los filtros
                    activos.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <AgentChatMessage
                  key={message.id}
                  message={message}
                  onRetry={
                    message.status === "error" &&
                    retry?.assistantId === message.id
                      ? handleRetry
                      : undefined
                  }
                />
              ))
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div
          className={cn(
            "border-t border-border bg-background px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            !tabBarVisible &&
              "motion-safe:animate-in motion-safe:duration-200 motion-safe:slide-in-from-bottom-2"
          )}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5">
            {suggestions.length > 0 ? (
              <div className="mb-1.5">
                <ViewSuggestionsRow
                  suggestions={suggestions}
                  variant="overlay"
                  selectedId={selectedSuggestionId}
                  onSelect={handleSelectSuggestion}
                  onRequestDismiss={setDismissTarget}
                />
              </div>
            ) : null}
            {pending && pendingStatus ? (
              <p
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                aria-live="polite"
              >
                <Spinner className="size-3" />
                {pendingStatus}
              </p>
            ) : null}
            <AgentChatComposer
              value={draft}
              onChange={setDraft}
              onSend={handleSend}
              pending={pending || showInitialLoading}
              inputRef={inputRef}
            />
          </div>
        </div>
      </div>

      <AgentChatHistorySheet
        open={historyOpen}
        onOpenChange={history.closeHandlerFor(AGENT_CHAT_HISTORY_PICKER)}
        activeConversationId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <AlertDialog
        open={dismissTarget !== null}
        onOpenChange={(open) => {
          if (!open && !dismissSuggestion.isPending) {
            setDismissTarget(null)
          }
        }}
      >
        <AlertDialogContent layerClassName="z-[100]">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <SparklesIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Descartar esta sugerencia?</AlertDialogTitle>
            <AlertDialogDescription>
              {dismissTarget
                ? `«${dismissTarget.label}» dejará de aparecer en esta vista.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dismissSuggestion.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={dismissSuggestion.isPending}
              onClick={() => void confirmDismissSuggestion()}
            >
              {dismissSuggestion.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {dismissSuggestion.isPending ? "Descartando..." : "Descartar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
