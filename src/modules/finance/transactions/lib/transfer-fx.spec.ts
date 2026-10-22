import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  crossCurrencyRate,
  crossExchangeRate,
  formatTransferRateInput,
  receivedFromRate,
  transferRateLabel,
} from "./transfer-fx.ts"

describe("crossCurrencyRate", () => {
  it("returns the rate and both currencies of a cross-currency transfer", () => {
    assert.deepEqual(
      crossCurrencyRate({
        currency: "USD",
        transferToCurrency: "DOP",
        exchangeRate: "61.45",
      }),
      { rate: "61.45", sourceCurrency: "USD", destinationCurrency: "DOP" }
    )
  })

  it("returns null when the transfer stays in one currency", () => {
    assert.equal(
      crossCurrencyRate({
        currency: "DOP",
        transferToCurrency: "DOP",
        exchangeRate: "1",
      }),
      null
    )
  })

  it("returns null without a destination currency or a rate", () => {
    assert.equal(
      crossCurrencyRate({
        currency: "USD",
        transferToCurrency: null,
        exchangeRate: "61.45",
      }),
      null
    )
    assert.equal(
      crossCurrencyRate({
        currency: "USD",
        transferToCurrency: "DOP",
        exchangeRate: null,
      }),
      null
    )
  })
})

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
