"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { MessageSquareTextIcon, SendIcon, XIcon } from "lucide-react"
import { type KeyboardEvent } from "react"

type ChatInputProps = {
  value: string
  onChange: (text: string) => void
  onSend: () => void
  disabled?: boolean
  contextLabel?: string | null
  onClearContext?: () => void
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  contextLabel,
  onClearContext,
}: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border bg-background px-3 py-2 pb-4">
      {contextLabel ? (
        <div className="flex flex-row items-center gap-1">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <MessageSquareTextIcon
              className="size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span className="min-w-0 truncate">Contexto: {contextLabel}</span>
            <button
              type="button"
              aria-label="Quitar contexto"
              className="shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={onClearContext}
            >
              <XIcon className="size-3.5" />
            </button>
          </span>
        </div>
      ) : null}
      <div className="flex flex-row items-end gap-0.5">
        <Textarea
          placeholder="Mensaje"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          className="scrollbar-hide max-h-32 min-h-10 overflow-y-auto rounded-4xl p-3"
        />
        <Button
          size="icon"
          disabled={disabled || !value.trim()}
          onClick={onSend}
          className="size-10 rounded-full"
          aria-label="Enviar mensaje"
        >
          <SendIcon />
        </Button>
      </div>
    </div>
  )
}
