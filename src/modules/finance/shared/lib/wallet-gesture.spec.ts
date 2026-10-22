import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  classifyWalletGesture,
  isWalletDragOnly,
  walletGestureDelta,
} from "./wallet-gesture.ts"

describe("classifyWalletGesture", () => {
  it("treats a short horizontal offset as a press", () => {
    assert.equal(classifyWalletGesture(0), "press")
    assert.equal(classifyWalletGesture(8), "press")
    assert.equal(classifyWalletGesture(-16), "press")
  })

  it("advances the stack on a strong swipe to the left", () => {
    assert.equal(classifyWalletGesture(-70), "next")
    assert.equal(classifyWalletGesture(-120), "next")
  })

  it("goes back on a strong swipe to the right", () => {
    assert.equal(classifyWalletGesture(70), "previous")
    assert.equal(classifyWalletGesture(120), "previous")
  })

  it("treats in-between drags as a press, not a dead zone", () => {
    assert.equal(classifyWalletGesture(-40), "press")
    assert.equal(classifyWalletGesture(30), "press")
  })
})

describe("walletGestureDelta", () => {
  it("maps the swipe direction to a stack step", () => {
    assert.equal(walletGestureDelta("next"), 1)
    assert.equal(walletGestureDelta("previous"), -1)
    assert.equal(walletGestureDelta("press"), 0)
  })
})

describe("isWalletDragOnly", () => {
  it("separates a tap from the drag that closes a swipe", () => {
    assert.equal(isWalletDragOnly(0), false)
    assert.equal(isWalletDragOnly(8), false)
    assert.equal(isWalletDragOnly(-9), true)
    assert.equal(isWalletDragOnly(120), true)
  })
})
