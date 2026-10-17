import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  hasMovedBeyondLongPressSlop,
  LONG_PRESS_MOVE_SLOP_PX,
} from "./press-gesture.ts"

describe("hasMovedBeyondLongPressSlop", () => {
  it("ignores a still finger", () => {
    assert.equal(
      hasMovedBeyondLongPressSlop({ x: 10, y: 10 }, { x: 10, y: 10 }),
      false
    )
  })

  it("tolerates movement inside the slop", () => {
    assert.equal(
      hasMovedBeyondLongPressSlop(
        { x: 10, y: 10 },
        { x: 10 + LONG_PRESS_MOVE_SLOP_PX, y: 10 }
      ),
      false
    )
  })

  it("cancels when the finger travels on the x axis", () => {
    assert.equal(
      hasMovedBeyondLongPressSlop(
        { x: 10, y: 10 },
        { x: 10 + LONG_PRESS_MOVE_SLOP_PX + 1, y: 10 }
      ),
      true
    )
  })

  it("cancels when the finger travels on the y axis", () => {
    assert.equal(
      hasMovedBeyondLongPressSlop(
        { x: 10, y: 10 },
        { x: 10, y: 10 + LONG_PRESS_MOVE_SLOP_PX + 1 }
      ),
      true
    )
  })
})
