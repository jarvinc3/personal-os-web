"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Textarea } from "@/src/shared/components/ui/textarea"
import { SendIcon } from "lucide-react"
import { type KeyboardEvent } from "react"

type ChatInputProps = {
  value: string
  onChange: (text: string) => void
  onSend: () => void
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
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
    <div className="flex flex-row items-end gap-0.5 border-t border-border bg-background px-3 py-2 pb-4">
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
  )
}
