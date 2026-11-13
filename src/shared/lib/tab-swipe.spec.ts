import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getTabSwipeDirection } from "./tab-swipe.ts"

describe("getTabSwipeDirection", () => {
  it("moves to the next tab after a left swipe", () => {
    assert.equal(getTabSwipeDirection({ deltaX: -60, deltaY: 8 }), 1)
  })

  it("moves to the previous tab after a right swipe", () => {
    assert.equal(getTabSwipeDirection({ deltaX: 60, deltaY: 8 }), -1)
  })

  it("ignores a swipe below the distance threshold", () => {
    assert.equal(getTabSwipeDirection({ deltaX: -55, deltaY: 0 }), null)
  })

  it("ignores a vertical gesture", () => {
    assert.equal(getTabSwipeDirection({ deltaX: -60, deltaY: 80 }), null)
  })
})
