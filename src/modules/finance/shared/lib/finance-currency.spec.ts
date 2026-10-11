import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildFinanceCurrencyOptions,
  currencyFlagEmoji,
  currencyFlagRegion,
  formatCurrencyTrigger,
  normalizeTrackedCurrencies,
} from "./finance-currency.ts"

describe("normalizeTrackedCurrencies", () => {
  it("uppercases, dedupes and drops the base currency", () => {
    assert.deepEqual(
      normalizeTrackedCurrencies("dop", ["usd", "USD", "dop", ""]),
      ["USD"]
    )
  })
})

describe("buildFinanceCurrencyOptions", () => {
  it("lists the base currency then the tracked list", () => {
    assert.deepEqual(buildFinanceCurrencyOptions("DOP", ["USD", "EUR"]), [
      "DOP",
      "USD",
      "EUR",
    ])
    assert.deepEqual(buildFinanceCurrencyOptions("usd", ["EUR"]), [
      "USD",
      "EUR",
    ])
    assert.deepEqual(buildFinanceCurrencyOptions("EUR", ["DOP"]), [
      "EUR",
      "DOP",
    ])
  })

  it("appends historical extra codes after the tracked list", () => {
    assert.deepEqual(
      buildFinanceCurrencyOptions("DOP", ["GBP"], ["gbp", "USD"]),
      ["DOP", "GBP", "USD"]
    )
  })

  it("never duplicates the base even when tracked repeats it", () => {
    assert.deepEqual(buildFinanceCurrencyOptions("DOP", ["DOP", "dop"]), [
      "DOP",
    ])
  })
})

describe("currencyFlagRegion", () => {
  it("uses the country prefix and the euro override", () => {
    assert.equal(currencyFlagRegion("DOP"), "DO")
    assert.equal(currencyFlagRegion("EUR"), "EU")
    assert.equal(currencyFlagRegion("nope"), null)
  })
})

describe("currencyFlagEmoji", () => {
  it("uses the country prefix and the euro override", () => {
    assert.equal(currencyFlagEmoji("DOP"), "🇩🇴")
    assert.equal(currencyFlagEmoji("EUR"), "🇪🇺")
    assert.equal(currencyFlagEmoji("nope"), "🏳️")
  })
})

describe("formatCurrencyTrigger", () => {
  it("includes the flag, the code, and the narrow symbol", () => {
    const trigger = formatCurrencyTrigger("DOP")
    assert.match(trigger, /🇩🇴/)
    assert.match(trigger, /DOP/)
    assert.match(trigger, /\$/)
  })
})
