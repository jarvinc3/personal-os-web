import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  HISTORY_MAX_ITEMS,
  KEEP_AWAKE_HISTORY_KEY,
  appendHistoryEntry,
  historyEndReasonLabel,
  readHistory,
} from "./session-history.ts"

const NOW = Date.parse("2026-09-10T12:00:00.000Z")

function memoryStorage(initial?: Record<string, string>) {
  const data = new Map(Object.entries(initial ?? {}))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
    snapshot: () => Object.fromEntries(data),
  }
}

describe("appendHistoryEntry", () => {
  it("prepends a closed session and ignores interrupted-only gaps", () => {
    const storage = memoryStorage()
    const entry = appendHistoryEntry(storage, {
      startedAt: NOW - 25 * 60_000,
      endedAt: NOW,
      endReason: "paused",
    })

    assert.equal(entry.durationSeconds, 25 * 60)
    assert.equal(entry.endReason, "paused")
    assert.equal(readHistory(storage)[0]?.id, entry.id)
  })

  it("caps the list at the max item count", () => {
    const storage = memoryStorage()
    for (let index = 0; index < HISTORY_MAX_ITEMS + 5; index += 1) {
      appendHistoryEntry(
        storage,
        {
          startedAt: NOW - 60_000,
          endedAt: NOW,
          endReason: "paused",
        },
        `id-${index}`
      )
    }

    const history = readHistory(storage)
    assert.equal(history.length, HISTORY_MAX_ITEMS)
    assert.equal(history[0]?.id, `id-${HISTORY_MAX_ITEMS + 4}`)
  })

  it("skips entries without a positive duration", () => {
    const storage = memoryStorage()
    appendHistoryEntry(storage, {
      startedAt: NOW,
      endedAt: NOW,
      endReason: "paused",
    })
    assert.equal(readHistory(storage).length, 0)
    assert.equal(storage.snapshot()[KEEP_AWAKE_HISTORY_KEY], undefined)
  })

  it("accepts an explicit duration that excludes pause time", () => {
    const storage = memoryStorage()
    const entry = appendHistoryEntry(storage, {
      startedAt: NOW - 60_000,
      endedAt: NOW,
      durationSeconds: 40,
      endReason: "ended",
    })
    assert.equal(entry.durationSeconds, 40)
    assert.equal(readHistory(storage)[0]?.endReason, "ended")
  })
})

describe("historyEndReasonLabel", () => {
  it("returns Spanish labels for known reasons", () => {
    assert.equal(historyEndReasonLabel("paused"), "Pausada")
    assert.equal(historyEndReasonLabel("ended"), "Terminada")
    assert.equal(historyEndReasonLabel("countdown_finished"), "Temporizador")
    assert.equal(historyEndReasonLabel("tab_yielded"), "Otra pestaña")
    assert.equal(historyEndReasonLabel("layout_unmounted"), "Cierre")
  })
})
