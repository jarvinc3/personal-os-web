import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildFinanceCurrencyOptions } from "./finance-currency.ts"

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
