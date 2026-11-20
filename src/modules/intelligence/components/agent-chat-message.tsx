"use client"

import { RotateCcwIcon, SparklesIcon } from "lucide-react"

import { AgentChatMarkdown } from "@/src/modules/intelligence/components/agent-chat-markdown"
import type { AgentChatUiMessage } from "@/src/modules/intelligence/types/agent-chat.types"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn } from "@/src/shared/lib/utils"

export function AgentChatMessage({
  message,
  onRetry,
}: {
  message: AgentChatUiMessage
  onRetry?: () => void
}) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[88%] rounded-3xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          <p className="wrap-break-word whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-start">
      <div
        className={cn(
          "flex max-w-[92%] min-w-0 flex-col gap-2 rounded-3xl rounded-bl-md bg-muted/70 px-4 py-3 text-sm shadow-sm",
          message.status === "error" && "border border-destructive/30"
        )}
      >
        {message.status === "streaming" && !message.content ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-3.5" />
            Pensando…
          </span>
        ) : null}
        {message.content ? (
          <AgentChatMarkdown content={message.content} />
        ) : null}
        {message.status === "streaming" && message.content ? (
          <span
            className="h-3 w-1.5 animate-pulse rounded-full bg-foreground/50"
            aria-hidden
          />
        ) : null}
        {message.status === "error" ? (
          <div className="flex flex-col gap-2 border-t border-border/60 pt-2">
            <p className="text-xs text-muted-foreground">
              No se pudo completar la respuesta. Reintenta este turno sin
              escribir de nuevo.
            </p>
            {onRetry ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={onRetry}
              >
                <RotateCcwIcon />
                Reintentar
              </Button>
            ) : null}
          </div>
        ) : null}
        <span className="sr-only">
          {message.status === "streaming"
            ? "El agente está respondiendo"
            : "Respuesta del agente"}
        </span>
        <SparklesIcon
          className="size-3 self-end text-muted-foreground/60"
          aria-hidden
        />
      </div>
    </div>
  )
}
