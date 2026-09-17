"use client"

import { KeepAwakeActionBar } from "@/src/modules/keep-awake/components/keep-awake-action-bar"
import { KeepAwakeAlertSheet } from "@/src/modules/keep-awake/components/keep-awake-alert-sheet"
import { KeepAwakeDurationControls } from "@/src/modules/keep-awake/components/keep-awake-duration-controls"
import { KeepAwakeGridPattern } from "@/src/modules/keep-awake/components/keep-awake-grid-pattern"
import { KeepAwakeHelpSheet } from "@/src/modules/keep-awake/components/keep-awake-help-sheet"
import { KeepAwakeHistorySheet } from "@/src/modules/keep-awake/components/keep-awake-history-sheet"
import { KeepAwakePanelToolbar } from "@/src/modules/keep-awake/components/keep-awake-panel-toolbar"
import { KeepAwakeReminderPrompt } from "@/src/modules/keep-awake/components/keep-awake-reminder-prompt"
import { KeepAwakeReminderSheet } from "@/src/modules/keep-awake/components/keep-awake-reminder-sheet"
import { KeepAwakeAuthenticatedPage } from "@/src/modules/keep-awake/components/layout/keep-awake-authenticated-page"
import { KeepAwakeUnsupported } from "@/src/modules/keep-awake/components/keep-awake-unsupported"
import { useKeepAwake } from "@/src/modules/keep-awake/context/keep-awake-context"
import { formatElapsed } from "@/src/modules/keep-awake/lib/format-elapsed"
import {
  DEFAULT_PREFS,
  getPrefsSnapshot,
  subscribePrefs,
  writePrefs,
} from "@/src/modules/keep-awake/lib/prefs"
import {
  DEFAULT_REMINDER,
  formatReminderTime,
  getReminderSnapshot,
  subscribeReminder,
} from "@/src/modules/keep-awake/lib/reminders"
import { getKeepAwakeCopy } from "@/src/modules/keep-awake/lib/session-status"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { Bell, Copy } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

function formatSessionStarted(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function KeepAwakeClient() {
  const {
    phase,
    elapsedSeconds,
    startTimestamp,
    timerDisplay,
    pipOpen,
    supportsPip,
    supportsWakeLock,
    toggle,
    activate,
    end,
    copyElapsed,
    openOrFocusPip,
    closePip,
  } = useKeepAwake()
  const prefs = useSyncExternalStore(
    subscribePrefs,
    getPrefsSnapshot,
    () => DEFAULT_PREFS
  )
  const reminder = useSyncExternalStore(
    subscribeReminder,
    getReminderSnapshot,
    () => DEFAULT_REMINDER
  )
  const [helpOpen, setHelpOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  if (!supportsWakeLock) {
    return (
      <KeepAwakeAuthenticatedPage>
        <KeepAwakeUnsupported />
      </KeepAwakeAuthenticatedPage>
    )
  }

  const countdown = timerDisplay.mode === "countdown" || prefs.timerMode === "countdown"
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
    <KeepAwakeAuthenticatedPage>
      <KeepAwakeReminderPrompt onConfirm={() => void activate()} />
      <div className="relative overflow-hidden">
        <KeepAwakeGridPattern />
        <div className="relative flex flex-col gap-4 px-4 pt-3 pb-6">
          <KeepAwakePanelToolbar
            reminderOpen={reminderOpen}
            reminderActive={reminder.enabled}
            reminderTime={formatReminderTime(reminder)}
            historyOpen={historyOpen}
            helpOpen={helpOpen}
            alertOpen={alertOpen}
            showPipAlert={!supportsPip}
            onReminderOpen={() => setReminderOpen(true)}
            onHistoryOpen={() => setHistoryOpen(true)}
            onHelpOpen={() => setHelpOpen(true)}
            onAlertOpen={() => setAlertOpen(true)}
          />

          <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
            <div
              className="flex flex-col items-center gap-2"
              role="group"
              aria-label="Sesión"
            >
              <div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-1.5">
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full transition-colors",
                    phase === "active" || phase === "pausing"
                      ? "bg-success shadow-[0_0_0_6px_color-mix(in_srgb,var(--success)_25%,transparent)] motion-safe:animate-pulse"
                      : phase === "interrupted"
                        ? "bg-warning shadow-[0_0_0_6px_color-mix(in_srgb,var(--warning)_25%,transparent)] motion-safe:animate-pulse"
                        : isPaused
                          ? "bg-warning shadow-[0_0_0_6px_color-mix(in_srgb,var(--warning)_25%,transparent)]"
                          : "bg-muted-foreground/40"
                  )}
                  aria-hidden
                />
                <span
                  className="text-sm font-medium text-foreground"
                  aria-live="polite"
                >
                  {copy.label}
                </span>
              </div>
              {startTimestamp && inSession ? (
                <span className="text-xs text-muted-foreground">
                  Desde las {formatSessionStarted(startTimestamp)}
                </span>
              ) : null}
              {reminder.enabled ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={cn(PRESSABLE_CLASS, "h-7 rounded-full px-3")}
                  aria-label={`Recordatorio ${formatReminderTime(reminder)}`}
                  onClick={() => setReminderOpen(true)}
                >
                  <Bell data-icon="inline-start" aria-hidden />
                  {formatReminderTime(reminder)}
                </Button>
              ) : null}
            </div>

            <div
              className="flex flex-col items-center gap-2"
              role="group"
              aria-label="Temporizador"
            >
              <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {timerDisplay.label}
              </span>
              <div className="relative flex items-center gap-1">
                <span
                  className="text-4xl font-bold tracking-tight tabular-nums text-foreground"
                  aria-live="off"
                >
                  {formatElapsed(timerDisplay.seconds)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn(PRESSABLE_CLASS, "absolute -right-8")}
                  aria-label="Copiar duración"
                  onClick={() => void copyElapsed()}
                  disabled={elapsedSeconds <= 0}
                >
                  <Copy aria-hidden />
                </Button>
              </div>
              {timerDisplay.mode === "countdown" && totalSeconds > 0 ? (
                <div
                  className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                  aria-hidden
                >
                  <div
                    className="h-full bg-success transition-[width] duration-1000 motion-reduce:transition-none"
                    style={{ width: `${remainingPercent}%` }}
                  />
                </div>
              ) : null}
            </div>

            <KeepAwakeDurationControls
              timerMode={prefs.timerMode}
              durationMinutes={prefs.durationMinutes}
              canEditMode={canEditMode}
              onChange={(next) => writePrefs({ ...prefs, ...next })}
            />

            <KeepAwakeActionBar
              toggleLabel={copy.toggleLabel}
              togglePressed={copy.togglePressed}
              busy={copy.busy}
              canToggle={copy.canToggle}
              canEnd={copy.canEnd}
              isLive={isLive}
              pipOpen={pipOpen}
              supportsPip={supportsPip}
              onToggle={() => void toggle()}
              onEnd={() => void end()}
              onOpenOrFocusPip={() => void openOrFocusPip()}
              onClosePip={closePip}
            />
          </div>
        </div>

        <KeepAwakeReminderSheet open={reminderOpen} onOpenChange={setReminderOpen} />
        <KeepAwakeHistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
        <KeepAwakeHelpSheet open={helpOpen} onOpenChange={setHelpOpen} />
        <KeepAwakeAlertSheet open={alertOpen} onOpenChange={setAlertOpen} />
      </div>
    </KeepAwakeAuthenticatedPage>
  )
}
