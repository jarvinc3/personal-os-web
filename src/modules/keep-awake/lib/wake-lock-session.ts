import { sessionElapsedSeconds } from "./format-elapsed.ts"
import { appendHistoryEntry, type SessionEndReason } from "./session-history.ts"
import {
  clearSessionRecord,
  parseChannelMessage,
  readSessionRecord,
  writeSessionRecord,
  type KeepAwakeChannelMessage,
  type KeepAwakeSessionRecord,
  type SessionStorageLike,
} from "./session-storage.ts"
import {
  INITIAL_KEEP_AWAKE_SESSION,
  reduceKeepAwakeSession,
  type KeepAwakeSessionState,
} from "./session-status.ts"
import { classifyWakeLockError, type WakeLockFailureKind } from "./wake-lock-error.ts"

export type WakeLockHandle = {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: "release", listener: () => void) => void
  removeEventListener?: (type: "release", listener: () => void) => void
}

export type ActivateOptions = {
  durationMs?: number
}

export type WakeLockSessionOptions = {
  ownerId: string
  now?: () => number
  isSupported: () => boolean
  requestWakeLock: () => Promise<WakeLockHandle>
  storage: SessionStorageLike
  broadcast?: (message: KeepAwakeChannelMessage) => void
  onChange?: (state: KeepAwakeSessionState) => void
}

export type WakeLockSession = {
  getState: () => KeepAwakeSessionState
  getLastFailure: () => WakeLockFailureKind | null
  activate: (options?: ActivateOptions) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  end: () => Promise<void>
  deactivate: (reason?: SessionEndReason) => Promise<void>
  toggle: (options?: ActivateOptions) => Promise<void>
  restoreIfNeeded: () => Promise<void>
  tryReacquire: () => Promise<void>
  releaseHeldLock: () => Promise<void>
  stopIfCountdownElapsed: () => Promise<void>
  handleRemoteMessage: (message: unknown) => Promise<void>
  dispose: () => Promise<void>
}

export function createWakeLockSession(
  options: WakeLockSessionOptions
): WakeLockSession {
  const now = options.now ?? Date.now
  let state: KeepAwakeSessionState = { ...INITIAL_KEEP_AWAKE_SESSION }
  let lastFailure: WakeLockFailureKind | null = null
  let sentinel: WakeLockHandle | null = null
  let disposed = false
  let inFlight: Promise<void> | null = null
  let releaseListener: (() => void) | null = null

  function setState(next: KeepAwakeSessionState) {
    state = next
    options.onChange?.(state)
  }

  function dispatch(action: Parameters<typeof reduceKeepAwakeSession>[1]) {
    setState(reduceKeepAwakeSession(state, action))
  }

  function persistClaim(record: Omit<KeepAwakeSessionRecord, "ownerId">) {
    writeSessionRecord(options.storage, {
      ...record,
      ownerId: options.ownerId,
    })
    options.broadcast?.({
      type: "claim",
      ownerId: options.ownerId,
      startTimestamp: record.startTimestamp,
    })
  }

  function persistCurrent() {
    if (state.startTimestamp == null) return
    persistClaim({
      startTimestamp: state.startTimestamp,
      endsAt: state.endsAt,
      userPaused: state.userPaused,
      pauseStartedAt: state.pauseStartedAt,
      accumulatedPauseMs: state.accumulatedPauseMs,
    })
  }

  function recordHistory(reason: SessionEndReason) {
    if (state.startTimestamp == null) return
    const endedAt = now()
    appendHistoryEntry(options.storage, {
      startedAt: state.startTimestamp,
      endedAt,
      durationSeconds: sessionElapsedSeconds(state, endedAt),
      endReason: reason,
    })
  }

  async function detachSentinel(release: boolean) {
    const current = sentinel
    sentinel = null
    if (!current) return
    if (releaseListener && current.removeEventListener) {
      current.removeEventListener("release", releaseListener)
    }
    releaseListener = null
    if (release && !current.released) {
      try {
        await current.release()
      } catch {
        /* already released */
      }
    }
  }

  function attachSentinel(handle: WakeLockHandle) {
    sentinel = handle
    releaseListener = () => {
      if (sentinel !== handle) return
      sentinel = null
      if (state.sessionRequested) {
        dispatch({ type: "lock_released" })
      }
    }
    handle.addEventListener("release", releaseListener)
  }

  async function requestAndAttach(): Promise<WakeLockHandle> {
    const handle = await options.requestWakeLock()
    attachSentinel(handle)
    return handle
  }

  async function activate(activateOptions?: ActivateOptions) {
    if (disposed) return
    if (!options.isSupported()) {
      lastFailure = "unsupported"
      return
    }
    if (state.userPaused) {
      await resume()
      return
    }
    if (state.sessionRequested) {
      if (!state.lockHeld) await tryReacquire()
      return
    }
    if (state.pending) return

    dispatch({ type: "activate_started" })
    try {
      await requestAndAttach()
      const startTimestamp = now()
      const durationMs = activateOptions?.durationMs
      const endsAt =
        typeof durationMs === "number" && durationMs > 0
          ? startTimestamp + durationMs
          : null
      persistClaim({
        startTimestamp,
        endsAt,
        userPaused: false,
        pauseStartedAt: null,
        accumulatedPauseMs: 0,
      })
      lastFailure = null
      dispatch({ type: "activate_succeeded", startTimestamp, endsAt })
    } catch (error) {
      lastFailure = classifyWakeLockError(error)
      await detachSentinel(true)
      dispatch({ type: "activate_failed" })
      throw error
    }
  }

  async function pause() {
    if (disposed) return
    if (!state.sessionRequested || state.userPaused || state.pending) return

    dispatch({ type: "pause_started" })
    await detachSentinel(true)
    dispatch({ type: "pause_succeeded", pauseStartedAt: now() })
    persistCurrent()
  }

  async function resume() {
    if (disposed) return
    if (!state.sessionRequested || !state.userPaused || state.pending) return
    if (!options.isSupported()) {
      lastFailure = "unsupported"
      return
    }

    dispatch({ type: "resume_started" })
    try {
      await requestAndAttach()
      const pauseMs =
        state.pauseStartedAt != null ? Math.max(0, now() - state.pauseStartedAt) : 0
      const accumulatedPauseMs = state.accumulatedPauseMs + pauseMs
      const endsAt = state.endsAt != null ? state.endsAt + pauseMs : null
      lastFailure = null
      dispatch({ type: "resume_succeeded", accumulatedPauseMs, endsAt })
      persistCurrent()
    } catch (error) {
      lastFailure = classifyWakeLockError(error)
      await detachSentinel(true)
      dispatch({ type: "resume_failed" })
      throw error
    }
  }

  async function deactivate(reason: SessionEndReason = "ended") {
    if (disposed && !state.sessionRequested && !sentinel) return
    if (state.pending === "deactivate") return

    dispatch({ type: "deactivate_started" })
    recordHistory(reason)
    await detachSentinel(true)
    clearSessionRecord(options.storage)
    options.broadcast?.({ type: "stop", ownerId: options.ownerId })
    lastFailure = null
    dispatch({ type: "deactivate_succeeded" })
  }

  async function restoreIfNeeded() {
    if (disposed || state.sessionRequested || state.pending) return
    if (!options.isSupported()) return

    const record = readSessionRecord(options.storage, now())
    if (!record) return

    if (record.endsAt != null && record.endsAt <= now() && !record.userPaused) {
      appendHistoryEntry(options.storage, {
        startedAt: record.startTimestamp,
        endedAt: record.endsAt,
        endReason: "countdown_finished",
      })
      clearSessionRecord(options.storage)
      return
    }

    if (record.userPaused) {
      dispatch({
        type: "restore_succeeded",
        startTimestamp: record.startTimestamp,
        endsAt: record.endsAt,
        lockHeld: false,
        userPaused: true,
        pauseStartedAt: record.pauseStartedAt,
        accumulatedPauseMs: record.accumulatedPauseMs,
      })
      persistCurrent()
      return
    }

    try {
      await requestAndAttach()
      persistClaim({
        startTimestamp: record.startTimestamp,
        endsAt: record.endsAt,
        userPaused: false,
        pauseStartedAt: record.pauseStartedAt,
        accumulatedPauseMs: record.accumulatedPauseMs,
      })
      lastFailure = null
      dispatch({
        type: "restore_succeeded",
        startTimestamp: record.startTimestamp,
        endsAt: record.endsAt,
        lockHeld: true,
        userPaused: false,
        pauseStartedAt: record.pauseStartedAt,
        accumulatedPauseMs: record.accumulatedPauseMs,
      })
    } catch (error) {
      lastFailure = classifyWakeLockError(error)
      await detachSentinel(true)
    }
  }

  async function releaseHeldLock() {
    if (disposed) return
    await detachSentinel(true)
    if (state.sessionRequested) {
      dispatch({ type: "lock_released" })
    }
  }

  async function tryReacquire() {
    if (
      disposed ||
      !state.sessionRequested ||
      state.lockHeld ||
      state.pending ||
      state.userPaused
    ) {
      return
    }
    if (!options.isSupported()) return

    try {
      await requestAndAttach()
      lastFailure = null
      dispatch({ type: "reacquire_succeeded" })
    } catch (error) {
      lastFailure = classifyWakeLockError(error)
    }
  }

  async function stopIfCountdownElapsed() {
    if (!state.sessionRequested || state.userPaused || state.endsAt == null) return
    if (state.endsAt > now()) return
    await deactivate("countdown_finished")
  }

  async function yieldToRemote(recordHistoryEntry: boolean) {
    if (recordHistoryEntry && state.sessionRequested) {
      recordHistory("tab_yielded")
    }
    await detachSentinel(true)
    lastFailure = null
    dispatch({ type: "remote_stopped" })
  }

  async function handleRemoteMessage(message: unknown) {
    const parsed =
      parseChannelMessage(message) ??
      (message && typeof message === "object" && "type" in message
        ? (message as KeepAwakeChannelMessage)
        : null)
    if (!parsed) return
    if (parsed.ownerId === options.ownerId) return

    if (parsed.type === "claim") {
      const sameSession = parsed.startTimestamp === state.startTimestamp
      await enqueue(() => yieldToRemote(!sameSession))
      return
    }

    if (parsed.type === "stop") {
      await enqueue(() => yieldToRemote(false))
    }
  }

  async function dispose() {
    disposed = true
    await detachSentinel(true)
    dispatch({ type: "deactivate_succeeded" })
  }

  async function enqueue(task: () => Promise<void>) {
    const run = (inFlight ?? Promise.resolve()).then(task, task)
    inFlight = run.then(
      () => undefined,
      () => undefined
    )
    await run
  }

  return {
    getState: () => state,
    getLastFailure: () => lastFailure,
    activate: (activateOptions) => enqueue(() => activate(activateOptions)),
    pause: () => enqueue(pause),
    resume: () => enqueue(resume),
    end: () => enqueue(() => deactivate("ended")),
    deactivate: (reason) => enqueue(() => deactivate(reason)),
    toggle: (activateOptions) =>
      enqueue(async () => {
        if (state.userPaused) {
          await resume()
        } else if (state.sessionRequested) {
          await pause()
        } else {
          await activate(activateOptions)
        }
      }),
    restoreIfNeeded: () => enqueue(restoreIfNeeded),
    tryReacquire: () => enqueue(tryReacquire),
    releaseHeldLock: () => enqueue(releaseHeldLock),
    stopIfCountdownElapsed: () => enqueue(stopIfCountdownElapsed),
    handleRemoteMessage,
    dispose: () => enqueue(dispose),
  }
}
