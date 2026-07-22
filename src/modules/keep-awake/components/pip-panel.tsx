"use client"

import { formatElapsed } from "@/src/modules/keep-awake/lib/format-elapsed"
import { cn } from "@/src/shared/lib/utils"
import { Pause, Play, Sparkles } from "lucide-react"

type PipPanelProps = {
  active: boolean
  elapsedSeconds: number
  onToggle: () => void
}

export function PipPanel({ active, elapsedSeconds, onToggle }: PipPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-2 p-2",
        "bg-background text-foreground"
      )}
      aria-label="Controles Keep Awake"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="grid size-4.5 shrink-0 place-items-center rounded-[5px] bg-primary text-primary-foreground"
            aria-hidden
          >
            <Sparkles className="size-2.5" />
          </span>
          <span className="truncate text-xs font-semibold tracking-tight">
            Keep Awake
          </span>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap",
            active
              ? "rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-success shadow-sm"
              : "text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              active ? "bg-success" : "bg-danger"
            )}
            aria-hidden
          />
          {active ? "On" : "Off"}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5">
        <span className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Sesión
        </span>
        <span
          className="font-mono text-[1.75rem] leading-none font-bold tracking-tight tabular-nums"
          aria-live="off"
        >
          {formatElapsed(elapsedSeconds)}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggle}
        title={active ? "Desactivar" : "Activar"}
        className={cn(
          "flex h-6 w-full shrink-0 items-center justify-center gap-1 rounded-[10px] text-sm font-bold transition-colors",
          active ? "bg-success text-white" : "bg-danger text-white"
        )}
      >
        {active ? (
          <Pause className="size-3 fill-current" aria-hidden />
        ) : (
          <Play className="size-3 fill-current" aria-hidden />
        )}
      </button>
    </div>
  )
}
