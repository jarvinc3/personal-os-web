"use client"

import dynamic from "next/dynamic"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef } from "react"

import {
  AGENT_CHAT_CONTEXT_PARAM,
  AGENT_CHAT_SHEET_KEY,
  AGENT_CHAT_SUGGESTION_PARAM,
} from "@/src/modules/intelligence/constants/agent-chat"
import { ViewSuggestionsBar } from "@/src/modules/intelligence/components/view-suggestions-bar"
import {
  buildAgentInvocationContext,
  decodeAgentContext,
  encodeAgentContext,
} from "@/src/modules/intelligence/lib/agent-chat-context"
import {
  buildViewSuggestionScope,
  viewSuggestionScopeKey,
} from "@/src/modules/intelligence/lib/view-suggestions"
import type { AgentChatLaunchOptions } from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { useAgentChatLauncher } from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useTabBarVisible } from "@/src/shared/context/tab-bar-context"
import {
  SHEET_ID_QUERY_KEY,
  SHEET_PICKER_QUERY_KEY,
  SHEET_QUERY_KEY,
  type SheetExtraParams,
} from "@/src/shared/lib/sheet-navigation"

const CLEAR_OVERLAY_PARAMS = [
  AGENT_CHAT_CONTEXT_PARAM,
  AGENT_CHAT_SUGGESTION_PARAM,
]

// El historial y el chat no viajan en el trozo inicial de cada ruta autenticada.
const AgentChatOverlay = dynamic(
  () =>
    import("@/src/modules/intelligence/components/agent-chat-overlay").then(
      (module) => module.AgentChatOverlay
    ),
  { ssr: false, loading: () => null }
)

export function AgentChatHost() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabBarVisible = useTabBarVisible()
  const { register } = useAgentChatLauncher()
  const overlay = useSheetParam(AGENT_CHAT_SHEET_KEY, {
    clearParams: CLEAR_OVERLAY_PARAMS,
    pushOver: true,
  })
  const lastActiveElement = useRef<HTMLElement | null>(null)
  const lastActiveWasTrigger = useRef(false)
  const fallbackContext = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(SHEET_QUERY_KEY)
    params.delete(SHEET_ID_QUERY_KEY)
    params.delete(AGENT_CHAT_CONTEXT_PARAM)
    return buildAgentInvocationContext({ pathname, searchParams: params })
  }, [pathname, searchParams])

  const initialContext =
    decodeAgentContext(searchParams.get(AGENT_CHAT_CONTEXT_PARAM)) ??
    fallbackContext

  const currentContext = useMemo(
    () => buildAgentInvocationContext({ pathname, searchParams }),
    [pathname, searchParams]
  )

  const suggestionScope = useMemo(
    () => buildViewSuggestionScope({ pathname, searchParams }),
    [pathname, searchParams]
  )
  const showSuggestionsBar =
    !overlay.open &&
    tabBarVisible &&
    searchParams.get(SHEET_QUERY_KEY) === null &&
    searchParams.get(SHEET_PICKER_QUERY_KEY) === null

  const overlayRef = useRef(overlay)
  const currentContextRef = useRef(currentContext)

  useEffect(() => {
    overlayRef.current = overlay
    currentContextRef.current = currentContext
  })

  const open = useCallback((options?: AgentChatLaunchOptions) => {
    const currentOverlay = overlayRef.current
    if (currentOverlay.open) {
      if (options?.suggestionId) {
        currentOverlay.setOpen(true, currentOverlay.sheetId, {
          [AGENT_CHAT_SUGGESTION_PARAM]: options.suggestionId,
        })
      }
      return
    }
    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    lastActiveElement.current = activeElement
    lastActiveWasTrigger.current =
      activeElement?.hasAttribute("data-agent-chat-opener") ?? false
    const extraParams: SheetExtraParams = {
      [AGENT_CHAT_CONTEXT_PARAM]: encodeAgentContext(currentContextRef.current),
      [AGENT_CHAT_SUGGESTION_PARAM]: options?.suggestionId ?? null,
    }
    currentOverlay.setOpen(true, undefined, extraParams)
  }, [])

  useEffect(() => register(open), [open, register])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return
      }
      event.preventDefault()
      open()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  const close = useCallback(() => {
    overlay.setOpen(false)
  }, [overlay])

  const wasOpen = useRef(overlay.open)
  useEffect(() => {
    if (wasOpen.current && !overlay.open) {
      window.setTimeout(() => {
        const element = lastActiveElement.current
        const wasTrigger = lastActiveWasTrigger.current
        lastActiveElement.current = null
        lastActiveWasTrigger.current = false
        if (element?.isConnected) {
          element.focus()
          return
        }
        if (wasTrigger) {
          document
            .querySelector<HTMLElement>("[data-agent-chat-opener]")
            ?.focus()
        }
      }, 150)
    }
    wasOpen.current = overlay.open
  }, [overlay.open])

  const selectConversation = useCallback(
    (conversationId: string) => {
      overlay.setOpen(true, conversationId)
    },
    [overlay]
  )

  const startNewChat = useCallback(() => {
    overlay.setOpen(true, null)
  }, [overlay])

  const consumeSuggestion = useCallback(() => {
    const currentOverlay = overlayRef.current
    currentOverlay.setOpen(true, currentOverlay.sheetId, {
      [AGENT_CHAT_SUGGESTION_PARAM]: null,
    })
  }, [])

  return (
    <>
      {showSuggestionsBar ? (
        <ViewSuggestionsBar
          key={viewSuggestionScopeKey(suggestionScope)}
          scope={suggestionScope}
          onSelect={(suggestion) => open({ suggestionId: suggestion.id })}
        />
      ) : null}
      {overlay.open ? (
        <AgentChatOverlay
          conversationId={overlay.sheetId}
          initialContext={initialContext}
          suggestionId={searchParams.get(AGENT_CHAT_SUGGESTION_PARAM)}
          onSuggestionConsumed={consumeSuggestion}
          onSelectConversation={selectConversation}
          onNewChat={startNewChat}
          onClose={close}
        />
      ) : null}
    </>
  )
}
