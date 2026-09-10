import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { KEEP_AWAKE_HISTORY_KEY } from "./session-history.ts"
import { KEEP_AWAKE_STORAGE_KEY } from "./session-storage.ts"
import { createWakeLockSession } from "./wake-lock-session.ts"

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

function createFakeLock() {
  let released = false
  const listeners = new Set<() => void>()
  return {
    get released() {
      return released
    },
    async release() {
      if (released) return
      released = true
      for (const listener of listeners) listener()
    },
    addEventListener(_type: "release", listener: () => void) {
      listeners.add(listener)
    },
    removeEventListener(_type: "release", listener: () => void) {
      listeners.delete(listener)
    },
  }
}

describe("createWakeLockSession", () => {
  it("activates, persists ownership and holds the lock", async () => {
    const storage = memoryStorage()
    const broadcasts: unknown[] = []
    const lock = createFakeLock()
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => lock,
      storage,
      broadcast: (message) => broadcasts.push(message),
    })

    await session.activate()

    assert.equal(session.getState().sessionRequested, true)
    assert.equal(session.getState().lockHeld, true)
    assert.equal(session.getState().startTimestamp, NOW)
    assert.match(
      storage.snapshot()[KEEP_AWAKE_STORAGE_KEY] ?? "",
      /tab-a/
    )
    assert.deepEqual(broadcasts[0], {
      type: "claim",
      ownerId: "tab-a",
      startTimestamp: NOW,
    })
  })

  it("keeps the session after a page-level unmount simulation and releases on dispose", async () => {
    const lock = createFakeLock()
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => lock,
      storage: memoryStorage(),
    })

    await session.activate()
    assert.equal(lock.released, false)
    assert.equal(session.getState().lockHeld, true)

    await session.dispose()
    assert.equal(lock.released, true)
    assert.equal(session.getState().sessionRequested, false)
    assert.equal(session.getState().lockHeld, false)
  })

  it("marks the session interrupted when the system releases the sentinel", async () => {
    const lock = createFakeLock()
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => lock,
      storage: memoryStorage(),
    })

    await session.activate()
    await lock.release()

    assert.equal(session.getState().sessionRequested, true)
    assert.equal(session.getState().lockHeld, false)
  })

  it("releases the held lock without ending the session", async () => {
    const lock = createFakeLock()
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => lock,
      storage: memoryStorage(),
    })

    await session.activate()
    await session.releaseHeldLock()

    assert.equal(lock.released, true)
    assert.equal(session.getState().sessionRequested, true)
    assert.equal(session.getState().lockHeld, false)
  })

  it("reacquires after an interruption", async () => {
    const first = createFakeLock()
    const second = createFakeLock()
    let calls = 0
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => {
        calls += 1
        return calls === 1 ? first : second
      },
      storage: memoryStorage(),
    })

    await session.activate()
    await first.release()
    await session.tryReacquire()

    assert.equal(session.getState().lockHeld, true)
    assert.equal(second.released, false)
  })

  it("restores a valid stored session and ignores a stale one", async () => {
    const freshStorage = memoryStorage({
      [KEEP_AWAKE_STORAGE_KEY]: JSON.stringify({
        startTimestamp: NOW - 60_000,
        ownerId: "old-tab",
      }),
    })
    const restoredLock = createFakeLock()
    const restoring = createWakeLockSession({
      ownerId: "tab-b",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => restoredLock,
      storage: freshStorage,
    })

    await restoring.restoreIfNeeded()
    assert.equal(restoring.getState().sessionRequested, true)
    assert.equal(restoring.getState().startTimestamp, NOW - 60_000)
    assert.match(freshStorage.snapshot()[KEEP_AWAKE_STORAGE_KEY] ?? "", /tab-b/)

    const staleStorage = memoryStorage({
      [KEEP_AWAKE_STORAGE_KEY]: String(NOW - 25 * 60 * 60 * 1000),
    })
    const stale = createWakeLockSession({
      ownerId: "tab-c",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => {
        throw new Error("should not request")
      },
      storage: staleStorage,
    })

    await stale.restoreIfNeeded()
    assert.equal(stale.getState().sessionRequested, false)
    assert.equal(staleStorage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
  })

  it("yields to another tab without clearing the remote session", async () => {
    const storage = memoryStorage()
    const lock = createFakeLock()
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => lock,
      storage,
    })

    await session.activate()
    await session.handleRemoteMessage({
      type: "claim",
      ownerId: "tab-b",
      startTimestamp: NOW + 1,
    })

    assert.equal(lock.released, true)
    assert.equal(session.getState().sessionRequested, false)
    assert.match(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY] ?? "", /tab-a/)
  })

  it("does not request a lock when unsupported", async () => {
    let requested = false
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => false,
      requestWakeLock: async () => {
        requested = true
        return createFakeLock()
      },
      storage: memoryStorage(),
    })

    await session.activate()
    assert.equal(requested, false)
    assert.equal(session.getState().sessionRequested, false)
  })

  it("clears storage when the owner deactivates", async () => {
    const storage = memoryStorage()
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => createFakeLock(),
      storage,
    })

    await session.activate()
    await session.deactivate()

    assert.equal(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
    assert.equal(session.getState().sessionRequested, false)
  })

  it("stores endsAt for a countdown and auto-stops when expired", async () => {
    const storage = memoryStorage()
    let current = NOW
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => current,
      isSupported: () => true,
      requestWakeLock: async () => createFakeLock(),
      storage,
    })

    await session.activate({ durationMs: 5 * 60_000 })
    assert.equal(session.getState().endsAt, NOW + 5 * 60_000)
    assert.match(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY] ?? "", /endsAt/)

    current = NOW + 5 * 60_000
    await session.stopIfCountdownElapsed()

    assert.equal(session.getState().sessionRequested, false)
    assert.equal(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
  })

  it("does not restore an expired countdown", async () => {
    const storage = memoryStorage({
      [KEEP_AWAKE_STORAGE_KEY]: JSON.stringify({
        startTimestamp: NOW - 10 * 60_000,
        ownerId: "old-tab",
        endsAt: NOW - 1_000,
      }),
    })
    let requested = false
    const session = createWakeLockSession({
      ownerId: "tab-b",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => {
        requested = true
        return createFakeLock()
      },
      storage,
    })

    await session.restoreIfNeeded()
    assert.equal(requested, false)
    assert.equal(session.getState().sessionRequested, false)
    assert.equal(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
  })

  it("pauses without ending the session and resumes the same start timestamp", async () => {
    const storage = memoryStorage()
    let current = NOW
    const first = createFakeLock()
    const second = createFakeLock()
    let calls = 0
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => current,
      isSupported: () => true,
      requestWakeLock: async () => {
        calls += 1
        return calls === 1 ? first : second
      },
      storage,
    })

    await session.activate()
    current = NOW + 10_000
    await session.pause()

    assert.equal(first.released, true)
    assert.equal(session.getState().sessionRequested, true)
    assert.equal(session.getState().userPaused, true)
    assert.equal(session.getState().lockHeld, false)
    assert.equal(session.getState().startTimestamp, NOW)
    assert.equal(storage.snapshot()[KEEP_AWAKE_HISTORY_KEY], undefined)
    assert.match(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY] ?? "", /"userPaused":true/)

    current = NOW + 15_000
    await session.resume()

    assert.equal(session.getState().userPaused, false)
    assert.equal(session.getState().lockHeld, true)
    assert.equal(session.getState().startTimestamp, NOW)
    assert.equal(session.getState().accumulatedPauseMs, 5_000)
    assert.equal(second.released, false)
  })

  it("shifts a countdown deadline by the paused duration", async () => {
    const storage = memoryStorage()
    let current = NOW
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => current,
      isSupported: () => true,
      requestWakeLock: async () => createFakeLock(),
      storage,
    })

    await session.activate({ durationMs: 5 * 60_000 })
    current = NOW + 30_000
    await session.pause()
    current = NOW + 90_000
    await session.stopIfCountdownElapsed()
    assert.equal(session.getState().sessionRequested, true)

    await session.resume()
    assert.equal(session.getState().endsAt, NOW + 5 * 60_000 + 60_000)
  })

  it("does not reacquire a paused session on visibility", async () => {
    let calls = 0
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => {
        calls += 1
        return createFakeLock()
      },
      storage: memoryStorage(),
    })

    await session.activate()
    await session.pause()
    await session.tryReacquire()

    assert.equal(calls, 1)
    assert.equal(session.getState().userPaused, true)
    assert.equal(session.getState().lockHeld, false)
  })

  it("restores a paused session without grabbing the lock", async () => {
    const storage = memoryStorage({
      [KEEP_AWAKE_STORAGE_KEY]: JSON.stringify({
        startTimestamp: NOW - 60_000,
        ownerId: "old-tab",
        endsAt: NOW + 4 * 60_000,
        userPaused: true,
        pauseStartedAt: NOW - 10_000,
        accumulatedPauseMs: 5_000,
      }),
    })
    let requested = false
    const session = createWakeLockSession({
      ownerId: "tab-b",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => {
        requested = true
        return createFakeLock()
      },
      storage,
    })

    await session.restoreIfNeeded()
    assert.equal(requested, false)
    assert.equal(session.getState().sessionRequested, true)
    assert.equal(session.getState().userPaused, true)
    assert.equal(session.getState().lockHeld, false)
    assert.equal(session.getState().startTimestamp, NOW - 60_000)
  })

  it("toggle pauses and resumes instead of ending the session", async () => {
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => NOW,
      isSupported: () => true,
      requestWakeLock: async () => createFakeLock(),
      storage: memoryStorage(),
    })

    await session.activate()
    await session.toggle()
    assert.equal(session.getState().userPaused, true)
    assert.equal(session.getState().sessionRequested, true)

    await session.toggle()
    assert.equal(session.getState().userPaused, false)
    assert.equal(session.getState().lockHeld, true)
  })

  it("ends the session and writes history without using pause", async () => {
    const storage = memoryStorage()
    let current = NOW
    const session = createWakeLockSession({
      ownerId: "tab-a",
      now: () => current,
      isSupported: () => true,
      requestWakeLock: async () => createFakeLock(),
      storage,
    })

    await session.activate()
    current = NOW + 20_000
    await session.end()

    assert.equal(session.getState().sessionRequested, false)
    assert.equal(storage.snapshot()[KEEP_AWAKE_STORAGE_KEY], undefined)
    assert.match(storage.snapshot()[KEEP_AWAKE_HISTORY_KEY] ?? "", /"endReason":"ended"/)
  })
})
