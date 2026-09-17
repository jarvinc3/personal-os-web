"use client"

import { KeepAwakeHelpSheet } from "@/src/modules/keep-awake/components/keep-awake-help-sheet"
import { formatElapsed } from "@/src/modules/keep-awake/lib/format-elapsed"
import {
  COUNTDOWN_PRESETS_MINUTES,
  type TimerMode,
} from "@/src/modules/keep-awake/lib/prefs"
import {
  getKeepAwakeCopy,
  getPipActionLabel,
  type KeepAwakePhase,
  type TimerDisplay,
} from "@/src/modules/keep-awake/lib/session-status"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  AlertCircleIcon,
  HelpCircleIcon,
  Monitor,
  MonitorPlay,
  Pause,
  Play,
  Square,
  X,
} from "lucide-react"
import { useState } from "react"
import { KeepAwakeAlertSheet } from "./keep-awake-alert-sheet"

type KeepAwakeStatusPanelProps = {
  phase: KeepAwakePhase
  timerDisplay: TimerDisplay
  elapsedSeconds: number
  startTimestamp: number | null
  timerMode: TimerMode
  durationMinutes: number
  pipOpen: boolean
  supportsPip: boolean
  supportsWakeLock: boolean
  onTimerModeChange: (mode: TimerMode) => void
  onDurationMinutesChange: (minutes: number) => void
  onToggle: () => void
  onEnd: () => void
  onCopyElapsed: () => void
  onOpenOrFocusPip: () => void
  onClosePip: () => void
}

function formatSessionStarted(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function KeepAwakeStatusPanel({
  phase,
  timerDisplay,
  elapsedSeconds,
  startTimestamp,
  timerMode,
  durationMinutes,
  pipOpen,
  supportsPip,
  supportsWakeLock,
  onTimerModeChange,
  onDurationMinutesChange,
  onToggle,
  onEnd,
  onCopyElapsed,
  onOpenOrFocusPip,
  onClosePip,
}: KeepAwakeStatusPanelProps) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const countdown = timerDisplay.mode === "countdown" || timerMode === "countdown"
  const copy = getKeepAwakeCopy(phase, { supportsPip, countdown })
  const isLive = phase === "active" || phase === "interrupted" || phase === "pausing"
  const isPaused = phase === "paused"
  const inSession = isLive || isPaused || phase === "ending"
  const canEditMode = !inSession && phase !== "activating"
  const totalSeconds =
    timerDisplay.mode === "countdown"
      ? Math.max(1, elapsedSeconds + timerDisplay.seconds)
      : 0
  const remainingPercent =
    totalSeconds > 0 ? Math.round((timerDisplay.seconds / totalSeconds) * 100) : 0

  return (
    <SummarySection
      title="Estado"
      icon={Monitor}
      right={
        <>
          {supportsWakeLock && !supportsPip && (
            <Button
              variant="ghost"
              size="sm"
              className={PRESSABLE_CLASS}
              aria-label="Ayuda"
              aria-haspopup="dialog"
              aria-expanded={alertOpen}
              onClick={() => setAlertOpen(true)}
            >
              <AlertCircleIcon className="size-4" aria-hidden />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={PRESSABLE_CLASS}
            aria-label="Ayuda"
            aria-haspopup="dialog"
            aria-expanded={helpOpen}
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircleIcon className="size-4" aria-hidden />
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-1">
        <div className="flex items-start justify-between gap-3" role="group" aria-label="Sesión">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Sesión
            </span>
            <span
              className="text-xl font-semibold tracking-tight text-foreground"
              aria-live="polite"
            >
              {copy.label}
            </span>
            {startTimestamp && inSession ? (
              <span className="text-xs text-muted-foreground">
                Desde las {formatSessionStarted(startTimestamp)}
              </span>
            ) : null}
          </div>
          <span
            className={cn(
              "mt-1 size-3 shrink-0 rounded-full transition-colors",
              isLive
                ? "bg-success shadow-[0_0_0_6px_color-mix(in_srgb,var(--success)_25%,transparent)] motion-safe:animate-pulse"
                : isPaused
                  ? "bg-warning shadow-[0_0_0_6px_color-mix(in_srgb,var(--warning)_25%,transparent)]"
                  : supportsWakeLock
                    ? "bg-danger/70"
                    : "bg-muted-foreground/40"
            )}
            aria-hidden
          />
        </div>

        <div className="flex flex-col items-start gap-2" role="group" aria-label="Temporizador">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {timerDisplay.label}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-3xl font-bold tracking-tight tabular-nums"
              aria-live="off"
              aria-label="Copiar duración"
              onClick={elapsedSeconds > 0 ? onCopyElapsed : undefined}
              disabled={elapsedSeconds <= 0}
            >
              {formatElapsed(timerDisplay.seconds)}
            </Button>
          </div>
          {timerDisplay.mode === "countdown" && totalSeconds > 0 ? (
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              aria-hidden
            >
              <div
                className="h-full bg-success transition-[width] duration-1000 motion-reduce:transition-none"
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de sesión">
          <Button
            type="button"
            size="sm"
            variant={timerMode === "open" ? "default" : "outline"}
            className={PRESSABLE_CLASS}
            disabled={!canEditMode}
            aria-pressed={timerMode === "open"}
            onClick={() => onTimerModeChange("open")}
          >
            Libre
          </Button>
          <Button
            type="button"
            size="sm"
            variant={timerMode === "countdown" ? "default" : "outline"}
            className={PRESSABLE_CLASS}
            disabled={!canEditMode}
            aria-pressed={timerMode === "countdown"}
            onClick={() => onTimerModeChange("countdown")}
          >
            Temporizador
          </Button>
        </div>

        {timerMode === "countdown" && canEditMode ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Duración">
              {COUNTDOWN_PRESETS_MINUTES.map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  size="sm"
                  variant={durationMinutes === minutes ? "default" : "outline"}
                  className={PRESSABLE_CLASS}
                  aria-pressed={durationMinutes === minutes}
                  onClick={() => onDurationMinutesChange(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">Minutos</span>
              <Input
                type="number"
                min={1}
                max={24 * 60}
                value={durationMinutes}
                aria-label="Duración en minutos"
                className="max-w-24"
                onChange={(event) => {
                  const next = Number(event.target.value)
                  if (Number.isFinite(next)) onDurationMinutesChange(next)
                }}
              />
            </label>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2" role="group" aria-label="Acciones">
          <div className="flex gap-0.5" role="group" aria-label="Sesión y temporizador">
            <Button
              type="button"
              className={cn(
                "flex-1",
                PRESSABLE_CLASS,
                isLive && "bg-success text-white hover:bg-success/90",
                copy.canEnd && "rounded-r-none"
              )}
              disabled={!copy.canToggle}
              aria-pressed={copy.togglePressed}
              aria-busy={copy.busy}
              aria-label={copy.toggleLabel}
              onClick={onToggle}
            >
              {isLive ? (
                <Pause className="size-4" aria-hidden />
              ) : (
                <Play className="size-4" aria-hidden />
              )}
              {copy.toggleLabel}
            </Button>

            {copy.canEnd ? (
              <Button
                type="button"
                variant="destructive"
                className={cn("flex-1 rounded-l-none", PRESSABLE_CLASS)}
                aria-label="Terminar sesión"
                onClick={onEnd}
              >
                <Square className="size-4" aria-hidden />
                Terminar
              </Button>
            ) : null}
          </div>

          <div className="flex gap-0.5" role="group" aria-label="Miniplayer">
            {supportsPip && (
              <Button
                type="button"
                variant="outline"
                className={cn("flex-1", PRESSABLE_CLASS, pipOpen && "rounded-r-none")}
                disabled={!supportsPip}
                aria-expanded={pipOpen}
                aria-label={getPipActionLabel(pipOpen)}
                onClick={onOpenOrFocusPip}
              >
                <MonitorPlay className="size-4" aria-hidden />
                {getPipActionLabel(pipOpen)}
              </Button>
            )}

            {pipOpen ? (
              <Button
                type="button"
                variant="secondary"
                className={cn("flex-1 rounded-l-none border-secondary", PRESSABLE_CLASS)}
                aria-label="Cerrar miniplayer"
                onClick={onClosePip}
              >
                <X className="size-4" aria-hidden />
                Cerrar
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <KeepAwakeHelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
      <KeepAwakeAlertSheet open={alertOpen} onOpenChange={setAlertOpen} />
    </SummarySection>
  )
}
