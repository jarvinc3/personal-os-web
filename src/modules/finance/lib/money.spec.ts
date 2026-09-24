import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "./money.ts";

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
  it("formats DOP with its ISO code and dollar symbol", () => {
    assert.equal(
      formatFinanceMoney("78224.48", {
        currency: "DOP",
        showCents: true,
        compactNumbers: false,
      }),
      "DOP $78,224.48",
    )
  })

  it("normalizes USD and omits cents when configured", () => {
    assert.equal(
      formatFinanceMoney("510", {
        currency: "usd",
        showCents: false,
        compactNumbers: false,
      }),
      "USD $510",
    )
  })

  it("uses the real narrow symbol for non-dollar currencies", () => {
    assert.equal(
      formatFinanceMoney("1000", {
        currency: "EUR",
        showCents: false,
        compactNumbers: false,
      }),
      "EUR €1,000",
    )
  })

  it("keeps compact number preferences", () => {
    assert.equal(
      formatFinanceMoney("1200", {
        currency: "DOP",
        showCents: false,
        compactNumbers: true,
      }),
      "DOP $1K",
    )
  })

  it("returns an em dash for invalid amounts or currencies", () => {
    const display = {
      currency: "USD",
      showCents: true,
      compactNumbers: false,
    }
    assert.equal(formatFinanceMoney("nope", display), "—")
    assert.equal(formatFinanceMoney("10", { ...display, currency: "" }), "—")
  })

  it("prefixes + or - before the currency when leadingSign is set", () => {
    const display = {
      currency: "DOP",
      showCents: true,
      compactNumbers: false,
      leadingSign: true,
    }
    assert.equal(formatFinanceMoney("491.00", display), "+DOP $491.00")
    assert.equal(formatFinanceMoney("-159.00", display), "-DOP $159.00")
    assert.equal(formatFinanceMoney("0", display), "+DOP $0.00")
  })
})
