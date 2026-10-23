"use client"

import { Badge } from "@/src/shared/components/ui/badge"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CheckCircle2Icon,
  ClockIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"

export type SyncCardStatus = "ok" | "error" | "pending"

const STATUS_BADGE: Record<
  SyncCardStatus,
  { label: string; variant: "success" | "danger" | "warning" }
> = {
  ok: { label: "Correcto", variant: "success" },
  error: { label: "Fallido", variant: "danger" },
  pending: { label: "Pendiente", variant: "warning" },
}

const STATUS_ICON: Record<SyncCardStatus, LucideIcon> = {
  ok: CheckCircle2Icon,
  error: TriangleAlertIcon,
  pending: ClockIcon,
}

/** Card de bandeja, fuente, correo pendiente e historial; definitiva en #286. */
export function SyncCard({
  title,
  subtitle,
  status,
  icon: Icon,
  value,
  onPress,
}: {
  title: string
  subtitle: string
  status: SyncCardStatus
  icon: LucideIcon
  value?: string
  onPress?: () => void
}) {
  const badge = STATUS_BADGE[status]
  const StatusIcon = STATUS_ICON[status]

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left",
        PRESSABLE_CLASS
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant={badge.variant}>
          <StatusIcon aria-hidden />
          {badge.label}
        </Badge>
        {value ? (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {value}
          </span>
        ) : null}
      </span>
    </button>
  )
}
