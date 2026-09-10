import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  KEEP_AWAKE_STORAGE_KEY,
  clearSessionRecord,
  parseChannelMessage,
  parseSessionRecord,
  readSessionRecord,
  serializeSessionRecord,
  writeSessionRecord,
} from "./session-storage.ts"

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

describe("parseSessionRecord", () => {
  it("returns null for empty input", () => {
    assert.equal(parseSessionRecord(null, NOW), null)
    assert.equal(parseSessionRecord("", NOW), null)
  })

  it("parses a legacy epoch timestamp string", () => {
    const startTimestamp = NOW - 5 * 60_000
    const record = parseSessionRecord(String(startTimestamp), NOW)
    assert.deepEqual(record, {
      startTimestamp,
      ownerId: "",
      endsAt: null,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    })
  })

  it("parses a JSON session record", () => {
    const startTimestamp = NOW - 1_000
    const raw = JSON.stringify({ startTimestamp, ownerId: "tab-1" })
    assert.deepEqual(parseSessionRecord(raw, NOW), {
      startTimestamp,
      ownerId: "tab-1",
      endsAt: null,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    })
  })

  it("rejects NaN, non-finite and malformed values", () => {
    assert.equal(parseSessionRecord("abc", NOW), null)
    assert.equal(parseSessionRecord("Infinity", NOW), null)
    assert.equal(parseSessionRecord("{", NOW), null)
    assert.equal(
      parseSessionRecord(JSON.stringify({ startTimestamp: "nope" }), NOW),
      null
    )
  })

  it("rejects timestamps older than 24 hours", () => {
    const stale = NOW - 25 * 60 * 60 * 1000
    assert.equal(parseSessionRecord(String(stale), NOW), null)
  })

  it("rejects timestamps too far in the future", () => {
    const future = NOW + 10 * 60_000
    assert.equal(parseSessionRecord(String(future), NOW), null)
  })
})

describe("session storage helpers", () => {
  it("round-trips a record through serialize and parse", () => {
    const record = {
      startTimestamp: NOW - 2_000,
      ownerId: "tab-2",
      endsAt: null,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    }
    assert.deepEqual(
      parseSessionRecord(serializeSessionRecord(record), NOW),
      record
    )
  })

  it("round-trips a paused session", () => {
    const record = {
      startTimestamp: NOW - 8_000,
      ownerId: "tab-pause",
      endsAt: NOW + 52_000,
      userPaused: true,
      pauseStartedAt: NOW - 3_000,
      accumulatedPauseMs: 1_500,
    }
    assert.deepEqual(
      parseSessionRecord(serializeSessionRecord(record), NOW),
      record
    )
  })

  it("reads, writes and clears the keep-awake key", () => {
    const storage = memoryStorage()
    const record = {
      startTimestamp: NOW - 2_000,
      ownerId: "tab-3",
      endsAt: null,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    }

    writeSessionRecord(storage, record)
    assert.equal(
      storage.snapshot()[KEEP_AWAKE_STORAGE_KEY],
      serializeSessionRecord(record)
    )
    assert.deepEqual(readSessionRecord(storage, NOW), record)

    clearSessionRecord(storage)
    assert.equal(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
    assert.equal(readSessionRecord(storage, NOW), null)
  })

  it("clears stale records on read", () => {
    const stale = NOW - 25 * 60 * 60 * 1000
    const storage = memoryStorage({
      [KEEP_AWAKE_STORAGE_KEY]: String(stale),
    })

    assert.equal(readSessionRecord(storage, NOW), null)
    assert.equal(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
  })
})

describe("parseChannelMessage", () => {
  it("parses claim and stop payloads", () => {
    assert.deepEqual(
      parseChannelMessage({
        type: "claim",
        ownerId: "tab-a",
        startTimestamp: NOW,
      }),
      { type: "claim", ownerId: "tab-a", startTimestamp: NOW }
    )
    assert.deepEqual(parseChannelMessage({ type: "stop", ownerId: "tab-a" }), {
      type: "stop",
      ownerId: "tab-a",
    })
  })

  it("rejects malformed channel payloads", () => {
    assert.equal(parseChannelMessage(null), null)
    assert.equal(parseChannelMessage({ type: "claim" }), null)
    assert.equal(parseChannelMessage({ type: "stop", ownerId: "" }), null)
  })
})
