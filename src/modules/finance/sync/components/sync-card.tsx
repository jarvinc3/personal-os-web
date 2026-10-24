"use client"

import { Badge } from "@/src/shared/components/ui/badge"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CheckCircle2Icon,
  ClockIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"

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

type SyncCardProps = {
  title: string
  subtitle: string
  status: SyncCardStatus
  icon?: LucideIcon
  /** Logo de la institución en lugar del icono en círculo. */
  leading?: ReactNode
  value?: string
  /** Acción fuera del área que navega: Sincronizar, Reintentar o el chevron. */
  action?: ReactNode
  onPress?: () => void
  disabled?: boolean
}

/** Card de bandeja, fuente, correo pendiente e historial (#286). */
export function SyncCard({
  title,
  subtitle,
  status,
  icon: Icon,
  leading,
  value,
  action,
  onPress,
  disabled = false,
}: SyncCardProps) {
  const badge = STATUS_BADGE[status]
  const StatusIcon = STATUS_ICON[status]
  const content = (
    <>
      {leading ?? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          {Icon ? <Icon className="size-4" aria-hidden /> : null}
        </span>
      )}
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
    </>
  )
  const contentClassName = cn(
    "flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
  )

  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-2xl border border-border bg-card",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          disabled={disabled}
          className={cn(
            contentClassName,
            !disabled && PRESSABLE_CLASS,
            "disabled:cursor-not-allowed"
          )}
        >
          {content}
        </button>
      ) : (
        <div className={contentClassName}>{content}</div>
      )}
      {action ? (
        <div className="flex shrink-0 items-center pr-2">{action}</div>
      ) : null}
    </div>
  )
}
