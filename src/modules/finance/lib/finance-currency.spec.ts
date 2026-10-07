import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildFinanceCurrencyOptions,
  currencyFlagEmoji,
  currencyFlagRegion,
  formatCurrencyTrigger,
} from "./finance-currency.ts"

describe("buildFinanceCurrencyOptions", () => {
  it("lists the base currency then USD and EUR without duplicates", () => {
    assert.deepEqual(buildFinanceCurrencyOptions("DOP"), ["DOP", "USD", "EUR"])
    assert.deepEqual(buildFinanceCurrencyOptions("usd"), ["USD", "EUR"])
    assert.deepEqual(buildFinanceCurrencyOptions("EUR"), ["EUR", "USD"])
  })

  it("keeps a historical extra code without inserting new free-form currencies", () => {
    assert.deepEqual(buildFinanceCurrencyOptions("DOP", ["gbp", "USD"]), [
      "DOP",
      "USD",
      "EUR",
      "GBP",
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
