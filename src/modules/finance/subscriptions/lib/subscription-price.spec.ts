import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceSubscriptionPayment } from "@/src/modules/finance/shared/types/entities"
import {
  priceChangeOverMonths,
  subscriptionPriceHistory,
} from "./subscription-price.ts"

function payment(
  overrides: Partial<FinanceSubscriptionPayment> = {}
): FinanceSubscriptionPayment {
  return {
    id: "payment-1",
    amount: "100.00",
    currency: "DOP",
    paidAt: "2026-10-14T00:00:00.000Z",
    source: "AUTO",
    transactionId: null,
    transaction: null,
    ...overrides,
  }
}

const day = (value: string) => new Date(`${value}T00:00:00.000Z`)

describe("subscriptionPriceHistory", () => {
  it("keeps one change per new amount, newest first", () => {
    const history = subscriptionPriceHistory([
      payment({
        id: "p4",
        amount: "580.00",
        paidAt: "2026-10-14T00:00:00.000Z",
      }),
      payment({
        id: "p3",
        amount: "520.00",
        paidAt: "2026-04-14T00:00:00.000Z",
      }),
      payment({
        id: "p2",
        amount: "450.00",
        paidAt: "2026-01-14T00:00:00.000Z",
      }),
      payment({
        id: "p1",
        amount: "450.00",
        paidAt: "2026-01-10T00:00:00.000Z",
      }),
    ])

    assert.deepEqual(history.series, [
      { date: "2026-01-10", amount: 450 },
      { date: "2026-04-14", amount: 520 },
      { date: "2026-10-14", amount: 580 },
    ])
    assert.deepEqual(
      history.changes.map((change) => [
        change.date,
        change.previousAmount,
        change.percent,
      ]),
      [
        ["2026-10-14", 520, 11.5],
        ["2026-04-14", 450, 15.6],
        ["2026-01-10", null, null],
      ]
    )
  })

  it("does not rely on the order the API sends", () => {
    const history = subscriptionPriceHistory([
      payment({
        id: "p1",
        amount: "450.00",
        paidAt: "2026-01-14T00:00:00.000Z",
      }),
      payment({
        id: "p2",
        amount: "580.00",
        paidAt: "2026-10-14T00:00:00.000Z",
      }),
    ])

    assert.deepEqual(
      history.series.map((point) => point.amount),
      [450, 580]
    )
  })

  it("returns an empty history without payments", () => {
    assert.deepEqual(subscriptionPriceHistory([]), {
      series: [],
      changes: [],
    })
  })
})

describe("priceChangeOverMonths", () => {
  it("compares against the price in effect at the cutoff", () => {
    const { series } = subscriptionPriceHistory([
      payment({
        id: "p1",
        amount: "420.00",
        paidAt: "2023-03-12T00:00:00.000Z",
      }),
      payment({
        id: "p2",
        amount: "450.00",
        paidAt: "2026-01-14T00:00:00.000Z",
      }),
      payment({
        id: "p3",
        amount: "580.00",
        paidAt: "2026-10-14T00:00:00.000Z",
      }),
    ])

    assert.equal(
      priceChangeOverMonths({ series, months: 12, today: day("2026-10-20") }),
      38.1
    )
  })

  it("stays null when there is no older price to compare", () => {
    const { series } = subscriptionPriceHistory([
      payment({ amount: "580.00", paidAt: "2026-10-14T00:00:00.000Z" }),
    ])

    assert.equal(
      priceChangeOverMonths({ series, months: 12, today: day("2026-10-20") }),
      null
    )
    assert.equal(
      priceChangeOverMonths({
        series: [],
        months: 12,
        today: day("2026-10-20"),
      }),
      null
    )
  })
})
