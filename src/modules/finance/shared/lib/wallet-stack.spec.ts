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
