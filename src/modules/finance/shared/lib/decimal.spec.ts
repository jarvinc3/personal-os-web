import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  decimalAmount,
  decimalPercent,
  roundDecimal,
  sumDecimals,
  toDecimal,
} from "./decimal.ts"

describe("sumDecimals", () => {
  it("adds 0.1 and 0.2 to exactly 0.30", () => {
    assert.equal(sumDecimals(["0.1", "0.2"]).toFixed(2), "0.30")
  })

  it("sums API strings without float drift", () => {
    assert.equal(
      sumDecimals(["1000000.00", "0.01", "0.02"]).toFixed(2),
      "1000000.03"
    )
  })

  it("treats null and undefined as zero", () => {
    assert.equal(sumDecimals([null, undefined, "5"]).toFixed(2), "5.00")
  })
})

describe("roundDecimal", () => {
  it("rounds a half cent to the even cent", () => {
    assert.equal(roundDecimal("0.125").toFixed(2), "0.12")
    assert.equal(roundDecimal("0.135").toFixed(2), "0.14")
  })
})

describe("decimalPercent", () => {
  it("reads a share as a number and guards a zero base", () => {
    assert.equal(decimalPercent("25.00", "100.00"), 25)
    assert.equal(decimalPercent("1", "0"), 0)
  })
})

describe("decimalAmount", () => {
  it("returns the chart number for a decimal amount", () => {
    assert.equal(decimalAmount("145.63"), 145.63)
    assert.equal(toDecimal(null).toFixed(2), "0.00")
  })
})
