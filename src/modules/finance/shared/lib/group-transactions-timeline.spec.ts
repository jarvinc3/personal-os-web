import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceTransaction } from "../types/entities.ts"
import { buildTimelineMonths } from "./group-transactions-timeline.ts"
import { monthBannerSrc } from "./month-banners.ts"

function tx(
  partial: Pick<
    FinanceTransaction,
    "id" | "type" | "amount" | "transactionDate"
  > &
    Partial<
      Pick<
        FinanceTransaction,
        | "transferGroupId"
        | "amountBaseCurrency"
        | "status"
        | "linkedTransactionId"
      >
    >
): FinanceTransaction {
  return {
    status: "CONFIRMED",
    currency: "DOP",
    ledgerAmount: partial.amount,
    ledgerCurrency: "DOP",
    amountBaseCurrency: partial.amount,
    exchangeRate: null,
    accountId: "acc-1",
    accountName: "Cuenta",
    cardId: null,
    cardName: null,
    categoryId: null,
    merchant: partial.id,
    notes: null,
    source: "MANUAL",
    description: null,
    transferToAccountId: null,
    transferToAccountName: null,
    transferToCardId: null,
    transferToCardName: null,
    transferGroupId: null,
    ...partial,
  }
}

describe("monthBannerSrc", () => {
  it("maps September to the septiembre asset", () => {
    assert.equal(monthBannerSrc(9), "/banners/banner-septiembre.png")
    assert.equal(monthBannerSrc(1), "/banners/banner-enero.png")
  })
})

describe("buildTimelineMonths", () => {
  it("puts April 2 in the first clipped week and April 10 in a later week", () => {
    const months = buildTimelineMonths(
      [{ year: 2026, month: 4 }],
      [
        tx({
          id: "debit-2",
          type: "DEBIT",
          amount: "25.00",
          transactionDate: "2026-04-02T00:00:00.000Z",
        }),
        tx({
          id: "credit-10",
          type: "CREDIT",
          amount: "10.00",
          transactionDate: "2026-04-10",
        }),
      ]
    )
    const april = months[0]
    assert.ok(april)
    assert.equal(april.weeks.length >= 4, true)
    assert.equal(april.weeks[0]?.label, "mie 1 - sab 4")
    assert.deepEqual(
      april.weeks[0]?.days.map((day) => day.dateKey),
      ["2026-04-02"]
    )
    assert.deepEqual(
      april.weeks[0]?.days[0]?.items.map((item) => item.id),
      ["debit-2"]
    )
    const later = april.weeks.find((week) =>
      week.days.some((day) => day.dateKey === "2026-04-10")
    )
    assert.ok(later)
    assert.notEqual(later.id, april.weeks[0]?.id)
    assert.equal(
      later.days.some((day) => day.items.some((item) => item.id === "debit-2")),
      false
    )
  })

  it("orders the movements of a day by their hour", () => {
    const months = buildTimelineMonths(
      [{ year: 2026, month: 4 }],
      [
        tx({
          id: "tarde",
          type: "DEBIT",
          amount: "5.00",
          transactionDate: "2026-04-02T18:30:00.000Z",
        }),
        tx({
          id: "manana",
          type: "DEBIT",
          amount: "5.00",
          transactionDate: "2026-04-02T09:15:00.000Z",
        }),
      ]
    )
    const day = months[0]?.weeks[0]?.days.find(
      (item) => item.dateKey === "2026-04-02"
    )
    assert.deepEqual(
      day?.items.map((item) => item.id),
      ["manana", "tarde"]
    )
  })

  it("keeps empty weeks and ignores transfers in totals and day net", () => {
    const months = buildTimelineMonths(
      [{ year: 2026, month: 4 }],
      [
        tx({
          id: "credit",
          type: "CREDIT",
          amount: "500.00",
          transactionDate: "2026-04-02",
        }),
        tx({
          id: "debit",
          type: "DEBIT",
          amount: "100.00",
          transactionDate: "2026-04-02",
        }),
        tx({
          id: "transfer",
          type: "TRANSFER",
          amount: "50.00",
          transactionDate: "2026-04-02",
          transferGroupId: "grp-1",
        }),
      ]
    )
    const april = months[0]
    assert.ok(april)
    assert.equal(april.totals.income, 500)
    assert.equal(april.totals.expenses, 100)
    const day = april.weeks[0]?.days[0]
    assert.equal(day?.net, 400)
    assert.equal(day?.items.length, 3)
    assert.equal(
      april.weeks.every((week) => Array.isArray(week.days)),
      true
    )
    assert.equal(
      april.weeks.filter((week) => week.days.length === 0).length >= 1,
      true
    )
  })

  it("nets a day in base currency when a movement is in another currency", () => {
    const months = buildTimelineMonths(
      [{ year: 2026, month: 4 }],
      [
        tx({
          id: "dop-a",
          type: "DEBIT",
          amount: "500.00",
          transactionDate: "2026-04-02",
        }),
        tx({
          id: "dop-b",
          type: "DEBIT",
          amount: "500.00",
          transactionDate: "2026-04-02",
        }),
        tx({
          id: "usd",
          type: "DEBIT",
          amount: "1.00",
          amountBaseCurrency: "60.50",
          transactionDate: "2026-04-02",
        }),
      ]
    )
    const day = months[0]?.weeks[0]?.days[0]
    assert.equal(day?.net, -1060.5)
    assert.equal(months[0]?.totals.expenses, 1060.5)
  })

  it("renders months without transactions with weeks and no days", () => {
    const months = buildTimelineMonths([{ year: 2026, month: 4 }], [])
    assert.equal(months[0]?.weeks.length >= 4, true)
    assert.equal(
      months[0]?.weeks.every((week) => week.days.length === 0),
      true
    )
    assert.deepEqual(months[0]?.totals, { income: 0, expenses: 0 })
  })

  it("groups a reversal from another month with its original", () => {
    const months = buildTimelineMonths(
      [
        { year: 2026, month: 3 },
        { year: 2026, month: 4 },
      ],
      [
        tx({
          id: "reversal",
          type: "DEBIT",
          amount: "100.00",
          status: "REVERSED",
          linkedTransactionId: "original",
          transactionDate: "2026-04-05",
        }),
        tx({
          id: "original",
          type: "DEBIT",
          amount: "100.00",
          status: "REVERSED",
          transactionDate: "2026-03-20",
        }),
      ]
    )
    const marchDays = months[0]?.weeks.flatMap((week) => week.days) ?? []
    const aprilDays = months[1]?.weeks.flatMap((week) => week.days) ?? []
    const marchRows = marchDays.flatMap((day) => day.rows)
    assert.deepEqual(
      marchDays.map((day) => day.dateKey),
      ["2026-03-20"]
    )
    assert.deepEqual(
      marchRows.map((group) => group.original.id),
      ["original"]
    )
    assert.equal(marchRows[0]?.reversal?.id, "reversal")
    assert.deepEqual(aprilDays, [])
  })

  it("keeps the reversal pair out of the month totals", () => {
    const months = buildTimelineMonths(
      [
        { year: 2026, month: 3 },
        { year: 2026, month: 4 },
      ],
      [
        tx({
          id: "reversal",
          type: "DEBIT",
          amount: "100.00",
          status: "REVERSED",
          linkedTransactionId: "original",
          transactionDate: "2026-04-05",
        }),
        tx({
          id: "original",
          type: "DEBIT",
          amount: "100.00",
          status: "REVERSED",
          transactionDate: "2026-03-20",
        }),
      ]
    )
    assert.deepEqual(months[0]?.totals, { income: 0, expenses: 0 })
    assert.deepEqual(months[1]?.totals, { income: 0, expenses: 0 })
  })

  it("shows an orphan reversal alone with its badge data", () => {
    const months = buildTimelineMonths(
      [{ year: 2026, month: 4 }],
      [
        tx({
          id: "reversal",
          type: "DEBIT",
          amount: "100.00",
          status: "REVERSED",
          linkedTransactionId: "missing-original",
          transactionDate: "2026-04-05",
        }),
      ]
    )
    const rows = (months[0]?.weeks ?? [])
      .flatMap((week) => week.days)
      .flatMap((day) => day.rows)
    assert.equal(rows.length, 1)
    assert.equal(rows[0]?.original.id, "reversal")
    assert.equal(rows[0]?.reversal, undefined)
    assert.equal(rows[0]?.isOrphan, true)
  })

  it("keeps a partial reversal as two separate rows", () => {
    const months = buildTimelineMonths(
      [{ year: 2026, month: 4 }],
      [
        tx({
          id: "original",
          type: "DEBIT",
          amount: "100.00",
          transactionDate: "2026-04-05",
        }),
        tx({
          id: "reversal",
          type: "DEBIT",
          amount: "40.00",
          status: "REVERSED",
          linkedTransactionId: "original",
          transactionDate: "2026-04-06",
        }),
      ]
    )
    const days = months[0]?.weeks.flatMap((week) => week.days) ?? []
    const rows = days.flatMap((day) => day.rows)
    assert.deepEqual(
      rows.map((group) => group.original.id),
      ["original", "reversal"]
    )
    assert.equal(
      rows.every((group) => group.isPartial),
      true
    )
    assert.equal(
      rows.every((group) => group.reversal === undefined),
      true
    )
  })
})
