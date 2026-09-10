import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  elapsedSecondsSince,
  formatElapsed,
  remainingSecondsUntil,
  sessionElapsedSeconds,
  sessionRemainingSeconds,
} from "./format-elapsed.ts"

describe("formatElapsed", () => {
  it("formats zero as HH:MM:SS", () => {
    assert.equal(formatElapsed(0), "00:00:00")
  })

  it("formats minutes and seconds", () => {
    assert.equal(formatElapsed(61), "00:01:01")
  })

  it("formats hours", () => {
    assert.equal(formatElapsed(3661), "01:01:01")
  })

  it("keeps hours beyond 24", () => {
    assert.equal(formatElapsed(90061), "25:01:01")
  })

  it("floors fractional seconds", () => {
    assert.equal(formatElapsed(1.9), "00:00:01")
  })

  it("clamps negative values to zero", () => {
    assert.equal(formatElapsed(-5), "00:00:00")
  })
})

describe("elapsedSecondsSince", () => {
  it("returns whole seconds between timestamps", () => {
    assert.equal(elapsedSecondsSince(1_000, 6_500), 5)
  })

  it("returns zero when now is before start", () => {
    assert.equal(elapsedSecondsSince(10_000, 1_000), 0)
  })
})

describe("remainingSecondsUntil", () => {
  it("returns whole seconds remaining", () => {
    assert.equal(remainingSecondsUntil(6_500, 1_000), 5)
  })

  it("clamps to zero after the deadline", () => {
    assert.equal(remainingSecondsUntil(1_000, 10_000), 0)
  })
})

describe("sessionElapsedSeconds", () => {
  it("subtracts completed and in-progress pauses", () => {
    assert.equal(
      sessionElapsedSeconds(
        {
          startTimestamp: 1_000,
          userPaused: true,
          pauseStartedAt: 6_000,
          accumulatedPauseMs: 1_000,
        },
        8_000
      ),
      4
    )
  })

  it("returns zero without a start timestamp", () => {
    assert.equal(
      sessionElapsedSeconds({
        startTimestamp: null,
        userPaused: false,
        pauseStartedAt: null,
        accumulatedPauseMs: 0,
      }),
      0
    )
  })
})

describe("sessionRemainingSeconds", () => {
  it("freezes remaining time while the session is paused", () => {
    assert.equal(
      sessionRemainingSeconds(
        {
          endsAt: 20_000,
          userPaused: true,
          pauseStartedAt: 10_000,
        },
        15_000
      ),
      10
    )
  })
})
