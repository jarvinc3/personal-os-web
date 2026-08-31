import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "./money.ts"

describe("parseFinanceMoney", () => {
  it('parses "0.12" to 0.12', () => {
    assert.equal(parseFinanceMoney("0.12"), 0.12)
  })

  it('parses "145.63" to 145.63', () => {
    assert.equal(parseFinanceMoney("145.63"), 145.63)
  })

  it("parses numeric 1.5", () => {
    assert.equal(parseFinanceMoney(1.5), 1.5)
  })

  it("returns null for empty string", () => {
    assert.equal(parseFinanceMoney(""), null)
  })

  it("returns null for whitespace", () => {
    assert.equal(parseFinanceMoney("   "), null)
  })

  it("returns null for NaN input", () => {
    assert.equal(parseFinanceMoney("abc"), null)
    assert.equal(parseFinanceMoney(Number.NaN), null)
  })

  it("returns null for Infinity", () => {
    assert.equal(parseFinanceMoney("Infinity"), null)
  })
})

describe("formatFinanceMoney", () => {
  it("formats a money string with cents", () => {
    const formatted = formatFinanceMoney("145.63", {
      currency: "DOP",
      showCents: true,
      compactNumbers: false,
    })
    assert.match(formatted, /145/)
    assert.match(formatted, /63/)
  })

  it("does not treat invalid input as NaN in the output", () => {
    const formatted = formatFinanceMoney("nope", {
      currency: "USD",
      showCents: true,
      compactNumbers: false,
    })
    assert.equal(formatted.includes("NaN"), false)
  })
})
