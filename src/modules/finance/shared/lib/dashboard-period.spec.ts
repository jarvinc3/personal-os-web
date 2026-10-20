import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  financeDashboardRange,
  financeMonthSummaryRange,
} from "./dashboard-period.ts"

describe("financeDashboardRange", () => {
  it("uses weekStartsOn Monday for week period", () => {
    const now = new Date("2026-09-02T12:00:00")
    const range = financeDashboardRange("week", 1, now)
    assert.equal(range.dateFrom, "2026-08-31")
    assert.equal(range.dateTo, "2026-09-02")
    assert.equal(range.granularity, "day")
  })

  it("covers the whole calendar month for the home card", () => {
    const now = new Date("2026-09-02T12:00:00")
    const range = financeMonthSummaryRange(now)
    assert.equal(range.dateFrom, "2026-09-01")
    assert.equal(range.dateTo, "2026-09-30")
  })

  it("starts the month and year on calendar bounds", () => {
    const now = new Date("2026-09-02T12:00:00")
    const month = financeDashboardRange("month", 1, now)
    assert.equal(month.dateFrom, "2026-09-01")
    const year = financeDashboardRange("year", 1, now)
    assert.equal(year.dateFrom, "2026-01-01")
    assert.equal(year.granularity, "month")
  })
})
