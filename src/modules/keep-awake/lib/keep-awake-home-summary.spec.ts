import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { DEFAULT_PREFS } from "./prefs.ts"
import { DEFAULT_REMINDER } from "./reminders.ts"
import type { KeepAwakeHistoryEntry } from "./session-history.ts"
import { getKeepAwakeHomeSummary } from "./keep-awake-home-summary.ts"

const NOON = Date.parse("2026-10-05T12:00:00")

function entry(
  overrides: Partial<KeepAwakeHistoryEntry> & Pick<KeepAwakeHistoryEntry, "id">
): KeepAwakeHistoryEntry {
  return {
    startedAt: NOON - 25 * 60_000,
    endedAt: NOON - 10 * 60_000,
    durationSeconds: 15 * 60,
    endReason: "ended",
    ...overrides,
  }
}

const idleInput = {
  phase: "idle" as const,
  elapsedSeconds: 0,
  remainingSeconds: 0,
  endsAt: null,
  startTimestamp: null,
  history: [] as KeepAwakeHistoryEntry[],
  reminder: DEFAULT_REMINDER,
  prefs: DEFAULT_PREFS,
  now: NOON,
}

describe("getKeepAwakeHomeSummary", () => {
  it("summarizes an idle day with no sessions as inactive zeros", () => {
    const summary = getKeepAwakeHomeSummary(idleInput)

    assert.equal(summary.status.label, "Inactivo")
    assert.equal(summary.status.tone, "muted")
    assert.equal(summary.status.pulse, false)
    assert.deepEqual(summary.stats, [
      { key: "today", label: "Hoy", value: "0m" },
      { key: "last", label: "Última", value: "Ninguna" },
    ])
    assert.deepEqual(summary.chips, [
      { key: "reminder", label: "Sin aviso", muted: true },
      { key: "mode", label: "Libre", muted: false },
      { key: "sessions", label: "0 sesiones", muted: true },
    ])
  })

  it("adds closed sessions from today and ignores yesterday", () => {
    const summary = getKeepAwakeHomeSummary({
      ...idleInput,
      history: [
        entry({
          id: "today",
          startedAt: NOON - 40 * 60_000,
          endedAt: NOON - 10 * 60_000,
          durationSeconds: 25 * 60,
        }),
        entry({
          id: "yesterday",
          startedAt: NOON - 26 * 60 * 60_000,
          endedAt: NOON - 25 * 60 * 60_000,
          durationSeconds: 50 * 60,
        }),
      ],
    })

    assert.deepEqual(summary.stats, [
      { key: "today", label: "Hoy", value: "25m" },
      { key: "last", label: "Última", value: "25m" },
    ])
    assert.equal(summary.chips[2]?.label, "1 sesión")
  })

  it("treats an active open session as live time on top of today's history", () => {
    const summary = getKeepAwakeHomeSummary({
      ...idleInput,
      phase: "active",
      elapsedSeconds: 3661,
      startTimestamp: NOON - 3661_000,
      history: [
        entry({
          id: "earlier",
          durationSeconds: 15 * 60,
        }),
      ],
    })

    assert.equal(summary.status.label, "Activo")
    assert.equal(summary.status.tone, "success")
    assert.equal(summary.status.pulse, true)
    assert.deepEqual(summary.stats, [
      { key: "today", label: "Hoy", value: "1h 16m" },
      { key: "session", label: "Sesión", value: "01:01:01" },
    ])
    assert.equal(summary.chips[2]?.label, "2 sesiones")
  })

  it("shows remaining time when the live session is a countdown", () => {
    const summary = getKeepAwakeHomeSummary({
      ...idleInput,
      phase: "active",
      elapsedSeconds: 60,
      remainingSeconds: 14 * 60,
      endsAt: NOON + 14 * 60_000,
      startTimestamp: NOON - 60_000,
      prefs: { timerMode: "countdown", durationMinutes: 15 },
    })

    assert.deepEqual(summary.stats[1], {
      key: "session",
      label: "Quedan",
      value: "00:14:00",
    })
    assert.equal(summary.chips[1]?.label, "15 min")
  })

  it("uses warning tone when paused and keeps the frozen elapsed time", () => {
    const summary = getKeepAwakeHomeSummary({
      ...idleInput,
      phase: "paused",
      elapsedSeconds: 90,
      startTimestamp: NOON - 120_000,
    })

    assert.equal(summary.status.label, "Pausada")
    assert.equal(summary.status.tone, "warning")
    assert.equal(summary.status.pulse, false)
    assert.equal(summary.stats[1]?.value, "00:01:30")
  })

  it("surfaces the reminder time when it is enabled", () => {
    const summary = getKeepAwakeHomeSummary({
      ...idleInput,
      reminder: {
        ...DEFAULT_REMINDER,
        enabled: true,
        hour: 9,
        minute: 5,
      },
    })

    assert.deepEqual(summary.chips[0], {
      key: "reminder",
      label: "09:05 a.m.",
      muted: false,
    })
  })

  it("marks unsupported browsers without pulsing", () => {
    const summary = getKeepAwakeHomeSummary({
      ...idleInput,
      phase: "unsupported",
    })

    assert.equal(summary.status.label, "No disponible")
    assert.equal(summary.status.tone, "muted")
    assert.equal(summary.status.pulse, false)
  })
})
