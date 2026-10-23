"use client"

import { cn } from "@/src/shared/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type NoticeTone = "warning" | "danger" | "info"

const TONE_CLASS: Record<NoticeTone, string> = {
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-info/40 bg-info/10 text-info",
}

/** Aviso que muestra la card de su entidad con el mensaje (#274, #285). */
export function NoticeCard({
  icon: Icon,
  title,
  description,
  tone = "warning",
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  tone?: NoticeTone
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      {children}
      <div
        className={cn(
          "flex items-start gap-2 rounded-2xl border p-3",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>
    </div>
  )
}
