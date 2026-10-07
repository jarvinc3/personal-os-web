import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  applyCalculatorKey,
  calculatorCommitValue,
  calculatorHeadline,
  createCalculatorState,
  type CalculatorKey,
  type CalculatorState,
} from "./amount-calculator.ts"

function press(keys: CalculatorKey[], seed?: string): CalculatorState {
  return keys.reduce(
    (state, key) => applyCalculatorKey(state, key),
    createCalculatorState(seed),
  )
}

describe("applyCalculatorKey", () => {
  it("multiplies 916 × 80 into 73280", () => {
    const state = press(["9", "1", "6", "×", "8", "0", "="])
    assert.equal(state.draft, "73280")
    assert.equal(state.justEvaluated, true)
    assert.equal(Number.isFinite(Number(state.draft)), true)
  })

  it("clears with C", () => {
    const state = press(["9", "1", "6", "C"])
    assert.deepEqual(state, createCalculatorState())
  })

  it("deletes the last typed digit", () => {
    const state = press(["9", "1", "6", "backspace"])
    assert.equal(state.draft, "91")
  })

  it("turns the current operand into a percent", () => {
    const state = press(["8", "0", "%"])
    assert.equal(state.draft, "0.8")
  })

  it("shows 0 instead of Infinity when dividing by zero", () => {
    const state = press(["5", "÷", "0", "="])
    assert.equal(state.draft, "0")
    assert.equal(state.draft?.includes("Infinity"), false)
    assert.equal(Number.isFinite(Number(state.draft)), true)
  })

  it("chains operations left to right", () => {
    const state = press(["2", "+", "3", "×", "4", "="])
    assert.equal(state.draft, "20")
    assert.equal(calculatorHeadline(state), "20")
  })

  it("keeps the full expression until equals", () => {
    const typing = press([
      "5",
      "8",
      "9",
      "0",
      "5",
      "6",
      "×",
      "5",
      "6",
      "-",
      "8",
      "9",
      "+",
      "7",
      "0",
    ])
    assert.equal(calculatorHeadline(typing), "589056 × 56 - 89 + 70")
    assert.equal(calculatorCommitValue(typing), "32987117")
    const done = applyCalculatorKey(typing, "=")
    assert.equal(calculatorHeadline(done), "32987117")
    assert.equal(done.justEvaluated, true)
  })

  it("replaces a trailing operator instead of evaluating", () => {
    const state = press(["2", "+", "×"])
    assert.equal(calculatorHeadline(state), "2 ×")
    assert.equal(calculatorCommitValue(state), "2")
  })
})

describe("calculatorCommitValue", () => {
  it("returns the pending product before equals", () => {
    const state = press(["9", "1", "6", "×", "8", "0"])
    assert.equal(calculatorCommitValue(state), "73280")
  })

  it("returns the evaluated display after equals", () => {
    const state = press(["1", "0", "+", "5", "="])
    assert.equal(calculatorCommitValue(state), "15")
  })
})
