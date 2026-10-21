import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceSubscriptionUpcomingCharge } from "@/src/modules/finance/shared/types/entities"
import {
  subscriptionCalendarWeeks,
  subscriptionMonthLabel,
  subscriptionChargeSummary,
  subscriptionChargeSummaryLabel,
  subscriptionRestOfMonth,
} from "./subscription-calendar.ts"

function charge(
  date: string,
  overrides: Partial<FinanceSubscriptionUpcomingCharge> = {}
): FinanceSubscriptionUpcomingCharge {
  return {
    id: `${date}-${overrides.subscriptionId ?? "sub-1"}`,
    subscriptionId: "sub-1",
    name: "Netflix",
    logoUrl: null,
    amount: "100.00",
    currency: "DOP",
    date,
    daysUntil: 0,
    paymentMethod: null,
    ...overrides,
  }
}

describe("subscriptionMonthLabel", () => {
  it("writes the month in Spanish", () => {
    assert.equal(
      subscriptionMonthLabel({ year: 2026, month: 10 }),
      "Octubre 2026"
    )
    assert.equal(subscriptionMonthLabel({ year: 2026, month: 1 }), "Enero 2026")
  })

  it("fails on a month that does not exist", () => {
    assert.throws(
      () => subscriptionMonthLabel({ year: 2026, month: 13 }),
      /Unknown month: 13/
    )
    assert.throws(
      () => subscriptionMonthLabel({ year: 2026, month: 0 }),
      /Unknown month: 0/
    )
  })
})

describe("subscriptionCalendarWeeks", () => {
  it("lays October 2026 in weeks that start on Monday", () => {
    const weeks = subscriptionCalendarWeeks({
      year: 2026,
      month: 10,
      charges: [charge("2026-10-14"), charge("2026-10-15")],
      today: new Date(2026, 9, 14),
      windowDays: 5,
      weekStartsOn: 1,
    })

    assert.equal(weeks.length, 5)
    assert.equal(weeks[0]?.days[0]?.dayNumber, null)
    assert.equal(weeks[0]?.days[3]?.dayNumber, 1)
    const fourteenth = weeks[2]?.days[2]
    assert.equal(fourteenth?.date, "2026-10-14")
    assert.equal(fourteenth?.isToday, true)
    assert.equal(fourteenth?.inWindow, true)
    assert.equal(fourteenth?.charges.length, 1)
    const twentieth = weeks[3]?.days[1]
    assert.equal(twentieth?.inWindow, false)
  })

  it("drops the days of the next month from the grid", () => {
    const weeks = subscriptionCalendarWeeks({
      year: 2026,
      month: 10,
      charges: [],
      today: new Date(2026, 9, 14),
      windowDays: 5,
      weekStartsOn: 1,
    })
    const days = weeks.flatMap((week) => week.days)
    assert.equal(days.filter((day) => day.inMonth).length, 31)
    assert.equal(days.filter((day) => day.dayNumber === null).length, 4)
  })
})

describe("subscriptionChargeSummary", () => {
  it("adds the charges of one currency", () => {
    const summary = subscriptionChargeSummary({
      charges: [charge("2026-10-14"), charge("2026-10-15")],
      baseCurrency: "DOP",
    })
    assert.deepEqual(summary, { count: 2, total: "200.00", currency: "DOP" })
  })

  it("adds cent amounts without float drift", () => {
    const summary = subscriptionChargeSummary({
      charges: [
        charge("2026-10-14", { amount: "0.10" }),
        charge("2026-10-15", { amount: "0.20" }),
      ],
      baseCurrency: "DOP",
    })
    assert.deepEqual(summary, { count: 2, total: "0.30", currency: "DOP" })
  })

  it("only counts when the month mixes currencies", () => {
    const summary = subscriptionChargeSummary({
      charges: [
        charge("2026-10-14"),
        charge("2026-10-15", { currency: "USD" }),
      ],
      baseCurrency: "DOP",
    })
    assert.deepEqual(summary, { count: 2, total: null, currency: "DOP" })
    assert.equal(
      subscriptionChargeSummaryLabel({
        summary,
        showCents: false,
        locale: "es-DO",
      }),
      "2 cobros"
    )
  })

  it("labels the count with the total", () => {
    const summary = subscriptionChargeSummary({
      charges: [charge("2026-10-14")],
      baseCurrency: "DOP",
    })
    assert.equal(
      subscriptionChargeSummaryLabel({
        summary,
        showCents: false,
        locale: "es-DO",
      }),
      "1 cobro · DOP $100"
    )
  })
})

describe("subscriptionRestOfMonth", () => {
  it("keeps the charges from today on, oldest first", () => {
    const rest = subscriptionRestOfMonth(
      [charge("2026-10-22"), charge("2026-10-10"), charge("2026-10-14")],
      new Date(2026, 9, 14)
    )
    assert.deepEqual(
      rest.map((item) => item.date),
      ["2026-10-14", "2026-10-22"]
    )
  })
})
