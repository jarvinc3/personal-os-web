"use client"

import { getPipActionLabel } from "@/src/modules/keep-awake/lib/session-status"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { MonitorPlay, Pause, Play, Square, X } from "lucide-react"

type KeepAwakeActionBarProps = {
  toggleLabel: string
  togglePressed: boolean
  busy: boolean
  canToggle: boolean
  canEnd: boolean
  isLive: boolean
  pipOpen: boolean
  supportsPip: boolean
  onToggle: () => void
  onEnd: () => void
  onOpenOrFocusPip: () => void
  onClosePip: () => void
}

const actionClassName = cn(
  "h-12 min-h-12 flex-1 rounded-none border-0 text-base font-semibold first:rounded-l-2xl last:rounded-r-2xl",
  PRESSABLE_CLASS
)

export function KeepAwakeActionBar({
  toggleLabel,
  togglePressed,
  busy,
  canToggle,
  canEnd,
  isLive,
  pipOpen,
  supportsPip,
  onToggle,
  onEnd,
  onOpenOrFocusPip,
  onClosePip,
}: KeepAwakeActionBarProps) {
  const pipLabel = getPipActionLabel(pipOpen)

  return (
    <div
      className="flex overflow-hidden rounded-2xl border border-border"
      role="group"
      aria-label="Acciones"
    >
      <Button
        type="button"
        variant="outline"
        className={actionClassName}
        disabled={!canToggle}
        aria-pressed={togglePressed}
        aria-busy={busy}
        aria-label={toggleLabel}
        onClick={onToggle}
      >
        {isLive ? (
          <Pause className="size-5 text-foreground" aria-hidden />
        ) : (
          <Play className="size-5 text-success" aria-hidden />
        )}
        <span className="text-foreground">{toggleLabel}</span>
      </Button>

      {canEnd ? (
        <Button
          type="button"
          variant="outline"
          className={actionClassName}
          aria-label="Terminar sesión"
          onClick={onEnd}
        >
          <Square className="size-5 text-destructive" aria-hidden />
          <span className="text-foreground">Terminar</span>
        </Button>
      ) : null}

      {supportsPip ? (
        <Button
          type="button"
          variant="outline"
          className={actionClassName}
          aria-expanded={pipOpen}
          aria-label={pipLabel}
          onClick={onOpenOrFocusPip}
        >
          <MonitorPlay className="size-5 text-foreground" aria-hidden />
          <span className="text-foreground">{pipOpen ? "Enfocar" : "Miniplayer"}</span>
        </Button>
      ) : null}

      {pipOpen ? (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 min-h-12 w-12 shrink-0 rounded-none border-0 first:rounded-l-2xl last:rounded-r-2xl",
            PRESSABLE_CLASS
          )}
          aria-label="Cerrar miniplayer"
          onClick={onClosePip}
        >
          <X className="size-5 text-foreground" aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
