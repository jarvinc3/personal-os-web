import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  classifyWalletGesture,
  resetWalletGestureOffset,
} from "./wallet-gesture.ts"

describe("classifyWalletGesture", () => {
  it("treats a short vertical offset as a press", () => {
    assert.equal(classifyWalletGesture(0), "press")
    assert.equal(classifyWalletGesture(8), "press")
    assert.equal(classifyWalletGesture(-16), "press")
  })

  it("cycles the stack on a strong upward swipe", () => {
    assert.equal(classifyWalletGesture(-70), "cycle")
    assert.equal(classifyWalletGesture(-120), "cycle")
  })

  it("treats in-between drags as a press, not a dead zone", () => {
    assert.equal(classifyWalletGesture(-40), "press")
    assert.equal(classifyWalletGesture(30), "press")
  })

  it("classifies each interaction independently after a reset", () => {
    assert.equal(classifyWalletGesture(-90), "cycle")
    const nextOffset = resetWalletGestureOffset()
    assert.equal(nextOffset, 0)
    assert.equal(classifyWalletGesture(nextOffset), "press")
  })
})
