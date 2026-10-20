import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  crossExchangeRate,
  formatTransferRateInput,
  receivedFromRate,
  transferRateLabel,
} from "./transfer-fx.ts"

describe("crossExchangeRate", () => {
  it("derives the pair rate from quotes in the same base", () => {
    assert.equal(
      crossExchangeRate({ sourceRate: "1", destinationRate: "0.128" }),
      1 / 0.128
    )
  })

  it("returns null when a quote is missing or zero", () => {
    assert.equal(
      crossExchangeRate({ sourceRate: null, destinationRate: "0.128" }),
      null
    )
    assert.equal(
      crossExchangeRate({ sourceRate: "1", destinationRate: "0" }),
      null
    )
  })
})

describe("receivedFromRate", () => {
  it("rounds the received amount to cents", () => {
    assert.equal(receivedFromRate("100", "77.6544"), 7765.44)
  })

  it("returns null without amount or rate", () => {
    assert.equal(receivedFromRate("", "7.5"), null)
    assert.equal(receivedFromRate("100", null), null)
  })
})

describe("transfer rate formatting", () => {
  it("keeps up to eight decimals in the form", () => {
    assert.equal(formatTransferRateInput(7.6544321), "7.6544321")
    assert.equal(formatTransferRateInput(7.6500000001), "7.65")
  })

  it("describes the pair for the detail", () => {
    assert.equal(
      transferRateLabel({
        rate: "0.1287",
        sourceCurrency: "DOP",
        destinationCurrency: "USD",
      }),
      "1 DOP = 0.1287 USD"
    )
  })
})
