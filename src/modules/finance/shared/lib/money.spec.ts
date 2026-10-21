import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  currencyGlyph,
  financeMoneyDifference,
  formatCompactFinanceMoney,
  formatFinanceMoney,
  parseFinanceMoney,
  sanitizeAmountInput,
} from "./money.ts"

describe("sanitizeAmountInput", () => {
  it("drops letters and keeps one decimal point", () => {
    assert.equal(sanitizeAmountInput("sdkjfhsdfj"), "")
    assert.equal(sanitizeAmountInput("12abc.3.4"), "12.34")
    assert.equal(sanitizeAmountInput("1,50"), "1.50")
  })

  it("reads a thousands separator as grouping, never as a decimal", () => {
    assert.equal(sanitizeAmountInput("3,003"), "3003")
    assert.equal(sanitizeAmountInput("1,234,567.89"), "1234567.89")
    assert.equal(sanitizeAmountInput("DOP 19,997,000"), "19997000")
  })

  it("takes the separator closest to the digits as the decimal one", () => {
    assert.equal(sanitizeAmountInput("1.234,56"), "1234.56")
    assert.equal(sanitizeAmountInput("1,234.56"), "1234.56")
    assert.equal(sanitizeAmountInput("12.345,6"), "12345.6")
  })
})

describe("parseFinanceMoney", () => {
  it("reads grouped thousands with a decimal part", () => {
    assert.equal(parseFinanceMoney("19,997,000"), 19997000)
    assert.equal(parseFinanceMoney("1,234.5"), 1234.5)
  })

  it("keeps a decimal comma out of the grouped path", () => {
    assert.equal(parseFinanceMoney("1,50"), null)
  })
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
  it("replaces a repeated currency code with $ and keeps real symbols", () => {
    assert.equal(currencyGlyph("DOP", "DOP"), "$")
    assert.equal(currencyGlyph("DOP", "dop"), "$")
    assert.equal(currencyGlyph("USD", "$"), "$")
    assert.equal(currencyGlyph("EUR", "€"), "€")
    assert.equal(currencyGlyph("GBP", "£"), "£")
    assert.equal(currencyGlyph("DOP", undefined), null)
  })

  it("formats DOP with its ISO code and dollar symbol", () => {
    assert.equal(
      formatFinanceMoney("78224.48", {
        currency: "DOP",
        showCents: true,
        compactNumbers: false,
      }),
      "DOP $78,224.48"
    )
  })

  it("normalizes USD and omits cents when configured", () => {
    assert.equal(
      formatFinanceMoney("510", {
        currency: "usd",
        showCents: false,
        compactNumbers: false,
      }),
      "USD $510"
    )
  })

  it("uses the real narrow symbol for non-dollar currencies", () => {
    assert.equal(
      formatFinanceMoney("1000", {
        currency: "EUR",
        showCents: false,
        compactNumbers: false,
      }),
      "EUR €1,000"
    )
  })

  it("keeps compact number preferences", () => {
    assert.equal(
      formatFinanceMoney("1200", {
        currency: "DOP",
        showCents: false,
        compactNumbers: true,
      }),
      "DOP $1K"
    )
  })

  it("always abbreviates compact money even when the display prefers full numbers", () => {
    assert.equal(
      formatCompactFinanceMoney("78224.48", {
        currency: "DOP",
        showCents: true,
        compactNumbers: false,
        leadingSign: true,
      }),
      "+DOP $78.22K"
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

describe("financeMoneyDifference", () => {
  it("returns the signed change between two amounts", () => {
    assert.equal(financeMoneyDifference("100.00", "150.00"), 50)
    assert.equal(financeMoneyDifference("100.00", "40.00"), -60)
  })

  it("returns null when either amount is missing or not a number", () => {
    assert.equal(financeMoneyDifference("", "150.00"), null)
    assert.equal(financeMoneyDifference("100.00", ""), null)
    assert.equal(financeMoneyDifference(null, undefined), null)
    assert.equal(financeMoneyDifference("100.00", "abc"), null)
  })

  it("returns zero when the amount does not change", () => {
    assert.equal(financeMoneyDifference("100.00", "100.00"), 0)
  })
})
