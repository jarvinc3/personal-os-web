"use client"

import { MessageSquareTextIcon, SendIcon } from "lucide-react"
import type { KeyboardEvent, RefObject } from "react"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Textarea } from "@/src/shared/components/ui/textarea"

export function AgentChatComposer({
  value,
  onChange,
  onSend,
  pending,
  inputRef,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  pending: boolean
  inputRef?: RefObject<HTMLTextAreaElement | null>
}) {
  const canSend = value.trim().length > 0 && !pending

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return
    }
    event.preventDefault()
    if (canSend) {
      onSend()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="relative min-w-0 flex-1">
        <MessageSquareTextIcon
          className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
          aria-hidden
        />
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={4000}
          aria-label="Mensaje para el agente"
          className="scrollbar-hide max-h-32 min-h-10 resize-none rounded-3xl py-2.5 pr-3 pl-10"
        />
      </div>
      <Button
        type="button"
        size="icon-lg"
        onClick={onSend}
        disabled={!canSend}
        aria-label={pending ? "Esperando la respuesta" : "Enviar mensaje"}
        className="rounded-full"
      >
        {pending ? <Spinner className="size-4" /> : <SendIcon />}
      </Button>
    </div>
  )
}
