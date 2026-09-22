import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildTimelineMonths } from "./group-transactions-timeline.ts"
import { monthBannerSrc } from "./month-banners.ts"
import type { FinanceTransaction } from "../types/entities.ts"

function tx(
  partial: Pick<FinanceTransaction, "id" | "type" | "amount" | "transactionDate"> &
    Partial<Pick<FinanceTransaction, "transferGroupId">>,
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
      ],
    )
    const april = months[0]
    assert.ok(april)
    assert.equal(april.weeks.length >= 4, true)
    assert.equal(april.weeks[0]?.label, "mie 1 - sab 4")
    assert.deepEqual(
      april.weeks[0]?.days.map((day) => day.dateKey),
      ["2026-04-02"],
    )
    assert.deepEqual(
      april.weeks[0]?.days[0]?.items.map((item) => item.id),
      ["debit-2"],
    )
    const later = april.weeks.find((week) =>
      week.days.some((day) => day.dateKey === "2026-04-10"),
    )
    assert.ok(later)
    assert.notEqual(later.id, april.weeks[0]?.id)
    assert.equal(
      later.days.some((day) => day.items.some((item) => item.id === "debit-2")),
      false,
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
      ],
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
      true,
    )
    assert.equal(
      april.weeks.filter((week) => week.days.length === 0).length >= 1,
      true,
    )
  })

  it("renders months without transactions with weeks and no days", () => {
    const months = buildTimelineMonths([{ year: 2026, month: 4 }], [])
    assert.equal(months[0]?.weeks.length >= 4, true)
    assert.equal(
      months[0]?.weeks.every((week) => week.days.length === 0),
      true,
    )
    assert.deepEqual(months[0]?.totals, { income: 0, expenses: 0 })
  })
})
