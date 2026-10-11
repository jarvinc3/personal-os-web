import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { currencyDisplayName } from "./currency-display-name.ts"

describe("currencyDisplayName", () => {
  it("returns the Spanish currency name", () => {
    assert.equal(
      currencyDisplayName("USD").toLowerCase(),
      "dólar estadounidense"
    )
    assert.equal(currencyDisplayName("eur").toLowerCase(), "euro")
  })

  it("falls back to the normalized code for non ISO-3 input", () => {
    assert.equal(currencyDisplayName("us"), "US")
    assert.equal(currencyDisplayName(" dolares "), "DOLARES")
  })
})
