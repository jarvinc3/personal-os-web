import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  WALLET_VISIBLE_COUNT,
  normalizeWalletOffset,
  walletFrontIndex,
  walletOrderedItems,
  walletPositionLabel,
  walletVisibleItems,
  walletWrapDirection,
  WALLET_DECK_GAP_PX,
  WALLET_DECK_GUTTER_PX,
  WALLET_STACK_STEP_OPACITY,
  WALLET_STACK_STEP_ROTATE_DEG,
  WALLET_STACK_STEP_SCALE,
  WALLET_STACK_STEP_X_PX,
  WALLET_STACK_STEP_Y_PX,
  walletCardMotion,
} from "./wallet-stack.ts"

const six = [0, 1, 2, 3, 4, 5]

describe("wallet-stack", () => {
  it("maps any offset on a single item to front 0 and label 1/1", () => {
    assert.equal(walletFrontIndex(0, 1), 0)
    assert.equal(walletFrontIndex(4, 1), 0)
    assert.equal(walletFrontIndex(-3, 1), 0)
    assert.deepEqual(walletVisibleItems(["only"], 9), ["only"])
    assert.deepEqual(walletPositionLabel(-2, 1), { current: 1, total: 1 })
  })

  it("shows the first three items at offset 0", () => {
    assert.equal(WALLET_VISIBLE_COUNT, 3)
    assert.deepEqual(walletVisibleItems(six, 0), [0, 1, 2])
    assert.equal(walletFrontIndex(0, 6), 0)
  })

  it("wraps the visible window at offset 4 of 6", () => {
    assert.equal(walletFrontIndex(4, 6), 4)
    assert.deepEqual(walletOrderedItems(six, 4), [4, 5, 0, 1, 2, 3])
    assert.deepEqual(walletVisibleItems(six, 4), [4, 5, 0])
    assert.deepEqual(walletPositionLabel(4, 6), { current: 5, total: 6 })
  })

  it("treats offset -1 with length 6 as the last item in front", () => {
    assert.equal(normalizeWalletOffset(-1, 6), 5)
    assert.equal(walletFrontIndex(-1, 6), 5)
    assert.deepEqual(walletVisibleItems(six, -1), [5, 0, 1])
    assert.deepEqual(walletPositionLabel(-1, 6), { current: 6, total: 6 })
  })

  it("returns empty results when there are no items", () => {
    assert.equal(walletFrontIndex(3, 0), 0)
    assert.deepEqual(walletVisibleItems([], 2), [])
    assert.deepEqual(walletPositionLabel(1, 0), { current: 0, total: 0 })
  })
})

describe("walletWrapDirection", () => {
  it("bounces forward when the step leaves the last card", () => {
    assert.equal(walletWrapDirection(5, 1, 6), "forward")
  })

  it("bounces backward when the step leaves the first card", () => {
    assert.equal(walletWrapDirection(0, -1, 6), "backward")
  })

  it("does not bounce while the step stays inside the ring", () => {
    assert.equal(walletWrapDirection(2, 1, 6), null)
    assert.equal(walletWrapDirection(2, -1, 6), null)
  })

  it("reads an offset past the ring as the card it lands on", () => {
    assert.equal(walletWrapDirection(6, 1, 6), null)
    assert.equal(walletWrapDirection(6, -1, 6), "backward")
    assert.equal(walletWrapDirection(-1, 1, 6), "forward")
  })

  it("never bounces with one card or without a step", () => {
    assert.equal(walletWrapDirection(0, 1, 1), null)
    assert.equal(walletWrapDirection(0, 0, 6), null)
  })
})

describe("walletCardMotion", () => {
  it("stacks the cards behind the front one in ring order", () => {
    const front = walletCardMotion({
      deployed: false,
      index: 0,
      frontIndex: 0,
      total: 6,
      trackWidth: 352,
    })
    const second = walletCardMotion({
      deployed: false,
      index: 1,
      frontIndex: 0,
      total: 6,
      trackWidth: 352,
    })

    assert.deepEqual(front, {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
      interactive: true,
    })
    assert.equal(second.x, WALLET_STACK_STEP_X_PX)
    assert.equal(second.y, WALLET_STACK_STEP_Y_PX)
    assert.equal(second.rotate, WALLET_STACK_STEP_ROTATE_DEG)
    assert.equal(second.scale, 1 - WALLET_STACK_STEP_SCALE)
    assert.equal(second.opacity, 1 - WALLET_STACK_STEP_OPACITY)
    assert.equal(second.interactive, true)
  })

  it("wraps the stacked offsets around the ring", () => {
    const last = walletCardMotion({
      deployed: false,
      index: 5,
      frontIndex: 4,
      total: 6,
      trackWidth: 352,
    })
    const first = walletCardMotion({
      deployed: false,
      index: 0,
      frontIndex: 4,
      total: 6,
      trackWidth: 352,
    })

    assert.equal(last.x, WALLET_STACK_STEP_X_PX)
    assert.equal(first.x, WALLET_STACK_STEP_X_PX * 2)
  })

  it("hides and disables the cards that do not fit in the stack", () => {
    const hidden = walletCardMotion({
      deployed: false,
      index: 3,
      frontIndex: 0,
      total: 6,
      trackWidth: 352,
    })

    assert.equal(hidden.opacity, 0)
    assert.equal(hidden.interactive, false)
  })

  it("deploys the front card where the stack left it", () => {
    const front = walletCardMotion({
      deployed: true,
      index: 2,
      frontIndex: 2,
      total: 6,
      trackWidth: 352,
    })

    assert.deepEqual(front, {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
      interactive: true,
    })
  })

  it("spreads the deployed cards one card plus the gap apart", () => {
    const step = 352 - WALLET_DECK_GUTTER_PX * 2 + WALLET_DECK_GAP_PX
    const next = walletCardMotion({
      deployed: true,
      index: 3,
      frontIndex: 2,
      total: 6,
      trackWidth: 352,
    })
    const previous = walletCardMotion({
      deployed: true,
      index: 1,
      frontIndex: 2,
      total: 6,
      trackWidth: 352,
    })

    assert.equal(next.x, step)
    assert.equal(previous.x, -step)
    assert.equal(next.interactive, true)
    assert.ok(next.zIndex < 30)
  })

  it("keeps a finite layout before the container is measured", () => {
    const unmeasured = walletCardMotion({
      deployed: true,
      index: 1,
      frontIndex: 0,
      total: 6,
      trackWidth: 0,
    })

    assert.ok(Number.isFinite(unmeasured.x))
    assert.equal(unmeasured.scale, 1)
  })
})
