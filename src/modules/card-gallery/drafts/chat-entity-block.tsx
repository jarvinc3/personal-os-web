"use client"

import { SparklesIcon } from "lucide-react"
import type { ReactNode } from "react"

/** Burbuja del chat que envuelve la card real de una entidad (#287). */
export function ChatEntityBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex max-w-[95%] flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
        <SparklesIcon className="size-3.5" aria-hidden />
        {label}
      </span>
      <div className="rounded-2xl rounded-bl-md border border-border bg-card p-2 shadow-xs">
        {children}
      </div>
    </div>
  )
}
