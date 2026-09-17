"use client"

import { KeepAwakeHistory } from "@/src/modules/keep-awake/components/keep-awake-history"
import { KeepAwakeAuthenticatedPage } from "@/src/modules/keep-awake/components/layout/keep-awake-authenticated-page"
import { KeepAwakeReminderCard } from "@/src/modules/keep-awake/components/keep-awake-reminder"
import { KeepAwakeStatusPanel } from "@/src/modules/keep-awake/components/keep-awake-status-panel"
import { useKeepAwake } from "@/src/modules/keep-awake/context/keep-awake-context"
import {
  DEFAULT_PREFS,
  getPrefsSnapshot,
  subscribePrefs,
  writePrefs,
  type KeepAwakePrefs,
} from "@/src/modules/keep-awake/lib/prefs"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { MonitorOff } from "lucide-react"
import { useSyncExternalStore } from "react"

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

  function updatePrefs(next: KeepAwakePrefs) {
    writePrefs(next)
  }

  function startSession() {
    void toggle()
  }

  function confirmReminder() {
    void activate()
  }

  return (
    <KeepAwakeAuthenticatedPage>
      <div className="flex flex-col gap-8">
        {supportsWakeLock ? (
          <KeepAwakeStatusPanel
            phase={phase}
            timerDisplay={timerDisplay}
            elapsedSeconds={elapsedSeconds}
            startTimestamp={startTimestamp}
            timerMode={prefs.timerMode}
            durationMinutes={prefs.durationMinutes}
            pipOpen={pipOpen}
            supportsPip={supportsPip}
            supportsWakeLock={supportsWakeLock}
            onTimerModeChange={(timerMode) => updatePrefs({ ...prefs, timerMode })}
            onDurationMinutesChange={(durationMinutes) =>
              updatePrefs({ ...prefs, durationMinutes })
            }
            onToggle={startSession}
            onEnd={() => void end()}
            onCopyElapsed={() => void copyElapsed()}
            onOpenOrFocusPip={() => void openOrFocusPip()}
            onClosePip={closePip}
          />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MonitorOff />
              </EmptyMedia>
              <EmptyTitle>Wake Lock no está disponible</EmptyTitle>
              <EmptyDescription>
                Este navegador no admite la API necesaria para mantener la
                pantalla despierta. Prueba un navegador reciente basado en
                Chromium, o Safari/Firefox actualizados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {supportsWakeLock ? (
          <KeepAwakeReminderCard onConfirm={confirmReminder} />
        ) : null}

        <KeepAwakeHistory />
      </div>
    </KeepAwakeAuthenticatedPage>
  )
}
