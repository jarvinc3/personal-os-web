"use client"

import type { AppearanceStyleId } from "@/src/shared/appearance"
import { cn } from "@/src/shared/lib/utils"

type AppearanceStylePreviewProps = {
  style: AppearanceStyleId
  className?: string
}

/** Muestra los tokens del estilo sin depender de una pantalla real. */
export function AppearanceStylePreview({
  style,
  className,
}: AppearanceStylePreviewProps) {
  return (
    <div
      data-style={style}
      aria-hidden
      className={cn("rounded-xl bg-background p-3", className)}
    >
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="size-7 shrink-0 rounded-full bg-primary" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="h-1.5 w-2/3 rounded-full bg-foreground/25" />
            <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/30" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-6 flex-1 rounded-md bg-primary" />
          <div className="h-6 w-16 rounded-md border border-border bg-background" />
        </div>
      </div>
    </div>
  )
}
