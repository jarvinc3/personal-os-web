import { formatElapsed } from "./format-elapsed.ts"
import type { KeepAwakePrefs } from "./prefs.ts"
import { formatReminderTimeLabel, type KeepAwakeReminder } from "./reminders.ts"
import type { KeepAwakeHistoryEntry } from "./session-history.ts"
import { getKeepAwakeCopy, type KeepAwakePhase } from "./session-status.ts"

export type KeepAwakeHomeStatusTone = "success" | "warning" | "muted"

export type KeepAwakeHomeStatus = {
  label: string
  tone: KeepAwakeHomeStatusTone
  pulse: boolean
}

export type KeepAwakeHomeStat = {
  key: "today" | "session" | "last"
  label: string
  value: string
}

export type KeepAwakeHomeChip = {
  key: "reminder" | "mode" | "sessions"
  label: string
  muted: boolean
}

export type KeepAwakeHomeSummary = {
  status: KeepAwakeHomeStatus
  stats: KeepAwakeHomeStat[]
  chips: KeepAwakeHomeChip[]
}

export type KeepAwakeHomeSummaryInput = {
  phase: KeepAwakePhase
  elapsedSeconds: number
  remainingSeconds: number
  endsAt: number | null
  startTimestamp: number | null
  history: KeepAwakeHistoryEntry[]
  reminder: KeepAwakeReminder
  prefs: KeepAwakePrefs
  now?: number
}

const LIVE_PHASES = new Set<KeepAwakePhase>([
  "active",
  "interrupted",
  "pausing",
  "paused",
  "ending",
])

export function formatCompactSeconds(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0
  if (safe === 0) {
    return "0m"
  }
  if (safe < 60) {
    return `${safe}s`
  }
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

export function getKeepAwakeHomeSummary(
  input: KeepAwakeHomeSummaryInput
): KeepAwakeHomeSummary {
  const now = input.now ?? Date.now()
  const countdown =
    input.endsAt != null || input.prefs.timerMode === "countdown"
  const copy = getKeepAwakeCopy(input.phase, { supportsPip: false, countdown })
  const inSession = LIVE_PHASES.has(input.phase)
  const dayStart = startOfLocalDay(now)
  const todayHistory = input.history.filter(
    (entry) => entry.endedAt >= dayStart
  )
  const liveSeconds = inSession
    ? Math.max(0, Math.floor(input.elapsedSeconds))
    : 0
  const todaySeconds =
    todayHistory.reduce((sum, entry) => sum + entry.durationSeconds, 0) +
    liveSeconds
  const liveCountsAsSession = inSession && input.startTimestamp != null ? 1 : 0
  const sessionCount = todayHistory.length + liveCountsAsSession
  const last = input.history[0]

  return {
    status: {
      label: copy.label,
      ...statusPresentation(input.phase),
    },
    stats: [
      { key: "today", label: "Hoy", value: formatCompactSeconds(todaySeconds) },
      inSession
        ? {
            key: "session",
            label: input.endsAt != null ? "Quedan" : "Sesión",
            value: formatElapsed(
              input.endsAt != null
                ? input.remainingSeconds
                : input.elapsedSeconds
            ),
          }
        : {
            key: "last",
            label: "Última",
            value: last
              ? formatCompactSeconds(last.durationSeconds)
              : "Ninguna",
          },
    ],
    chips: [
      input.reminder.enabled
        ? {
            key: "reminder",
            label: formatReminderTimeLabel(input.reminder),
            muted: false,
          }
        : { key: "reminder", label: "Sin aviso", muted: true },
      {
        key: "mode",
        label:
          input.prefs.timerMode === "countdown"
            ? formatDurationMinutes(input.prefs.durationMinutes)
            : "Libre",
        muted: false,
      },
      {
        key: "sessions",
        label: sessionCount === 1 ? "1 sesión" : `${sessionCount} sesiones`,
        muted: sessionCount === 0,
      },
    ],
  }
}

function statusPresentation(
  phase: KeepAwakePhase
): Omit<KeepAwakeHomeStatus, "label"> {
  switch (phase) {
    case "active":
    case "pausing":
      return { tone: "success", pulse: true }
    case "interrupted":
    case "activating":
      return { tone: "warning", pulse: true }
    case "paused":
      return { tone: "warning", pulse: false }
    default:
      return { tone: "muted", pulse: false }
  }
}

function startOfLocalDay(now: number): number {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const leftover = minutes % 60
  if (leftover === 0) {
    return `${hours} h`
  }
  return `${hours} h ${leftover} min`
}
