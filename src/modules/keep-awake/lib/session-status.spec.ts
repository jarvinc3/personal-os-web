import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  deriveKeepAwakePhase,
  getKeepAwakeCopy,
  getPipActionLabel,
  reduceKeepAwakeSession,
  type KeepAwakeSessionState,
} from "./session-status.ts"

const idle: KeepAwakeSessionState = {
  sessionRequested: false,
  lockHeld: false,
  pending: null,
  startTimestamp: null,
  endsAt: null,
  userPaused: false,
  pauseStartedAt: null,
  accumulatedPauseMs: 0,
}

describe("deriveKeepAwakePhase", () => {
  it("returns unsupported when the API is missing", () => {
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: false,
        sessionRequested: false,
        lockHeld: false,
        pending: null,
        userPaused: false,
      }),
      "unsupported"
    )
  })

  it("returns activating, pausing and ending from pending work", () => {
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: false,
        lockHeld: false,
        pending: "activate",
        userPaused: false,
      }),
      "activating"
    )
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: true,
        lockHeld: true,
        pending: "pause",
        userPaused: false,
      }),
      "pausing"
    )
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: true,
        lockHeld: false,
        pending: "resume",
        userPaused: true,
      }),
      "activating"
    )
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: true,
        lockHeld: true,
        pending: "deactivate",
        userPaused: false,
      }),
      "ending"
    )
  })

  it("separates an active lock from an interrupted session", () => {
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: true,
        lockHeld: true,
        pending: null,
        userPaused: false,
      }),
      "active"
    )
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: true,
        lockHeld: false,
        pending: null,
        userPaused: false,
      }),
      "interrupted"
    )
  })

  it("treats a user pause as paused, not interrupted", () => {
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: true,
        lockHeld: false,
        pending: null,
        userPaused: true,
      }),
      "paused"
    )
  })

  it("returns idle when nothing is requested", () => {
    assert.equal(
      deriveKeepAwakePhase({
        supportsWakeLock: true,
        sessionRequested: idle.sessionRequested,
        lockHeld: idle.lockHeld,
        pending: idle.pending,
        userPaused: idle.userPaused,
      }),
      "idle"
    )
  })
})

describe("reduceKeepAwakeSession", () => {
  it("marks a successful activation as requested and held", () => {
    const activating = reduceKeepAwakeSession(idle, {
      type: "activate_started",
    })
    assert.equal(activating.pending, "activate")

    const active = reduceKeepAwakeSession(activating, {
      type: "activate_succeeded",
      startTimestamp: 1000,
      endsAt: null,
    })
    assert.deepEqual(active, {
      sessionRequested: true,
      lockHeld: true,
      pending: null,
      startTimestamp: 1000,
      endsAt: null,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    })
  })

  it("keeps the session requested when the system releases the lock", () => {
    const active: KeepAwakeSessionState = {
      sessionRequested: true,
      lockHeld: true,
      pending: null,
      startTimestamp: 1000,
      endsAt: 5000,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    }
    const interrupted = reduceKeepAwakeSession(active, {
      type: "lock_released",
    })
    assert.deepEqual(interrupted, {
      sessionRequested: true,
      lockHeld: false,
      pending: null,
      startTimestamp: 1000,
      endsAt: 5000,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    })

    const recovered = reduceKeepAwakeSession(interrupted, {
      type: "reacquire_succeeded",
    })
    assert.equal(recovered.lockHeld, true)
    assert.equal(recovered.sessionRequested, true)
  })

  it("clears local session state after a remote claim", () => {
    const active: KeepAwakeSessionState = {
      sessionRequested: true,
      lockHeld: true,
      pending: null,
      startTimestamp: 1000,
      endsAt: null,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    }
    const stopped = reduceKeepAwakeSession(active, { type: "remote_stopped" })
    assert.deepEqual(stopped, idle)
  })

  it("keeps the same session when the user pauses and resumes", () => {
    const active: KeepAwakeSessionState = {
      sessionRequested: true,
      lockHeld: true,
      pending: null,
      startTimestamp: 1000,
      endsAt: 61_000,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 0,
    }

    const pausing = reduceKeepAwakeSession(active, { type: "pause_started" })
    assert.equal(pausing.pending, "pause")

    const paused = reduceKeepAwakeSession(pausing, {
      type: "pause_succeeded",
      pauseStartedAt: 11_000,
    })
    assert.deepEqual(paused, {
      sessionRequested: true,
      lockHeld: false,
      pending: null,
      startTimestamp: 1000,
      endsAt: 61_000,
      userPaused: true,
      pauseStartedAt: 11_000,
      accumulatedPauseMs: 0,
    })

    const resuming = reduceKeepAwakeSession(paused, { type: "resume_started" })
    assert.equal(resuming.pending, "resume")

    const resumed = reduceKeepAwakeSession(resuming, {
      type: "resume_succeeded",
      accumulatedPauseMs: 5_000,
      endsAt: 66_000,
    })
    assert.deepEqual(resumed, {
      sessionRequested: true,
      lockHeld: true,
      pending: null,
      startTimestamp: 1000,
      endsAt: 66_000,
      userPaused: false,
      pauseStartedAt: null,
      accumulatedPauseMs: 5_000,
    })
  })

  it("stays paused if resume fails", () => {
    const paused: KeepAwakeSessionState = {
      sessionRequested: true,
      lockHeld: false,
      pending: "resume",
      startTimestamp: 1000,
      endsAt: null,
      userPaused: true,
      pauseStartedAt: 11_000,
      accumulatedPauseMs: 0,
    }
    const failed = reduceKeepAwakeSession(paused, { type: "resume_failed" })
    assert.equal(failed.pending, null)
    assert.equal(failed.userPaused, true)
    assert.equal(failed.lockHeld, false)
    assert.equal(failed.pauseStartedAt, 11_000)
  })

  it("rolls back a failed activation", () => {
    const activating = reduceKeepAwakeSession(idle, {
      type: "activate_started",
    })
    const failed = reduceKeepAwakeSession(activating, {
      type: "activate_failed",
    })
    assert.deepEqual(failed, idle)
  })
})

describe("keep-awake copy", () => {
  it("describes interrupted sessions without promising the lock survives hidden tabs", () => {
    const copy = getKeepAwakeCopy("interrupted", { supportsPip: true })
    assert.equal(copy.label, "Reintentando")
    assert.match(copy.description, /liberó|oculta|reintenta/i)
    assert.equal(copy.togglePressed, true)
    assert.equal(copy.canToggle, true)
  })

  it("disables the toggle while unsupported or busy", () => {
    assert.equal(
      getKeepAwakeCopy("unsupported", { supportsPip: false }).canToggle,
      false
    )
    assert.equal(
      getKeepAwakeCopy("activating", { supportsPip: true }).busy,
      true
    )
    assert.equal(
      getKeepAwakeCopy("pausing", { supportsPip: true }).canToggle,
      false
    )
    assert.equal(
      getKeepAwakeCopy("ending", { supportsPip: true }).canToggle,
      false
    )
  })

  it("offers continue and end on a paused session", () => {
    const copy = getKeepAwakeCopy("paused", { supportsPip: true })
    assert.equal(copy.label, "Pausada")
    assert.equal(copy.toggleLabel, "Continuar")
    assert.equal(copy.togglePressed, false)
    assert.equal(copy.canToggle, true)
    assert.equal(copy.canEnd, true)
    assert.match(copy.description, /misma sesión|continuar/i)
  })

  it("offers end only while a session exists", () => {
    assert.equal(getKeepAwakeCopy("idle", { supportsPip: true }).canEnd, false)
    assert.equal(getKeepAwakeCopy("active", { supportsPip: true }).canEnd, true)
    assert.equal(
      getKeepAwakeCopy("interrupted", { supportsPip: true }).canEnd,
      true
    )
    assert.equal(getKeepAwakeCopy("paused", { supportsPip: true }).canEnd, true)
    assert.equal(
      getKeepAwakeCopy("ending", { supportsPip: true }).canEnd,
      false
    )
  })

  it("labels the PiP action as focus when the miniplayer is already open", () => {
    assert.equal(getPipActionLabel(false), "Miniplayer")
    assert.equal(getPipActionLabel(true), "Enfocar miniplayer")
  })
})
