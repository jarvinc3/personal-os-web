import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getTimerDisplay } from "./session-status.ts"

describe("getTimerDisplay", () => {
  it("shows elapsed time for an open-ended session, including idle zero", () => {
    assert.deepEqual(
      getTimerDisplay({ endsAt: null, elapsedSeconds: 0, remainingSeconds: 0 }),
      { label: "Tiempo", seconds: 0, mode: "open" }
    )
    assert.deepEqual(
      getTimerDisplay({
        endsAt: null,
        elapsedSeconds: 90,
        remainingSeconds: 0,
      }),
      { label: "Tiempo", seconds: 90, mode: "open" }
    )
  })

  it("shows remaining time for a countdown without mixing both numbers", () => {
    assert.deepEqual(
      getTimerDisplay({
        endsAt: 1_000,
        elapsedSeconds: 30,
        remainingSeconds: 120,
      }),
      { label: "Quedan", seconds: 120, mode: "countdown" }
    )
  })
})
