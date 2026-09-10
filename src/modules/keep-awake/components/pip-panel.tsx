"use client"

import { formatElapsed } from "@/src/modules/keep-awake/lib/format-elapsed"
import type { KeepAwakePhase, TimerDisplay } from "@/src/modules/keep-awake/lib/session-status"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { Pause, Play } from "lucide-react"

type PipPanelProps = {
  phase: KeepAwakePhase
  timerDisplay: TimerDisplay
  onToggle: () => void
}

export function PipPanel({ phase, timerDisplay, onToggle }: PipPanelProps) {
  const isLive = phase === "active" || phase === "interrupted" || phase === "pausing"
  const isPaused = phase === "paused"
  const toggleLabel = isLive ? "Pausar" : isPaused ? "Continuar" : "Activar"
  const statusLabel = isLive ? "Activo" : isPaused ? "Pausada" : "Inactivo"

  return (
    <div
      className="flex h-full w-full flex-col gap-2 bg-background p-2 text-foreground"
      aria-label="Controles Keep Awake"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">
          Keep Awake
        </span>
        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap",
            isLive
              ? "border border-success/20 bg-success/10 text-success"
              : isPaused
                ? "border border-warning/20 bg-warning/10 text-warning"
                : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isLive ? "bg-success" : isPaused ? "bg-warning" : "bg-danger"
            )}
            aria-hidden
          />
          {statusLabel}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5">
        <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {timerDisplay.label}
        </span>
        <span
          className="text-2xl leading-none font-bold tracking-tight tabular-nums"
          aria-live="off"
        >
          {formatElapsed(timerDisplay.seconds)}
        </span>
      </div>

      <Button
        type="button"
        size="sm"
        className={cn(
          "h-7 w-full",
          PRESSABLE_CLASS,
          isLive
            ? "bg-success text-white hover:bg-success/90"
            : isPaused
              ? undefined
              : "bg-danger text-white hover:bg-danger/90"
        )}
        aria-pressed={isLive}
        aria-label={toggleLabel}
        onClick={onToggle}
      >
        {isLive ? (
          <Pause className="size-3" aria-hidden />
        ) : (
          <Play className="size-3" aria-hidden />
        )}
        {toggleLabel}
      </Button>
    </div>
  )
}
