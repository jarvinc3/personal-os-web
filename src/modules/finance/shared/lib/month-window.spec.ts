import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  extendMonthRange,
  initialMonthRange,
  intersectIsoDateRange,
  isoMonthBounds,
  listYearMonths,
  monthKey,
  parseMonthKey,
  previousMonthsBounds,
  yearsTouched,
} from "./month-window.ts"

describe("initialMonthRange", () => {
  it("spans 12 months back and stops at the next month", () => {
    const range = initialMonthRange(new Date(2026, 8, 22))
    assert.equal(range.from.getFullYear(), 2025)
    assert.equal(range.from.getMonth(), 8)
    assert.equal(range.from.getDate(), 1)
    assert.equal(range.to.getFullYear(), 2026)
    assert.equal(range.to.getMonth(), 9)
    assert.equal(range.to.getDate(), 1)
  })
})

describe("extendMonthRange", () => {
  it("extends the far edge but never past the next month", () => {
    const range = {
      from: new Date(2025, 8, 1),
      to: new Date(2027, 6, 1),
    }
    const next = extendMonthRange({
      range,
      active: new Date(2027, 6, 1),
      now: new Date(2027, 6, 15),
    })
    assert.equal(next.from.getFullYear(), 2025)
    assert.equal(next.from.getMonth(), 8)
    assert.equal(next.to.getFullYear(), 2027)
    assert.equal(next.to.getMonth(), 7)
    assert.equal(next.to.getDate(), 1)
    assert.deepEqual(yearsTouched(range.from, next.to), [2025, 2026, 2027])
  })

  it("does not extend into empty future months", () => {
    const range = {
      from: new Date(2025, 8, 1),
      to: new Date(2026, 11, 1),
    }
    const next = extendMonthRange({
      range,
      active: new Date(2028, 0, 1),
      now: new Date(2026, 10, 20),
    })
    assert.equal(next.to.getFullYear(), 2026)
    assert.equal(next.to.getMonth(), 11)
  })

  it("does not shrink when the active month is in the middle", () => {
    const range = {
      from: new Date(2025, 8, 1),
      to: new Date(2027, 8, 1),
    }
    const next = extendMonthRange({
      range,
      active: new Date(2026, 8, 1),
      now: new Date(2026, 8, 1),
    })
    assert.equal(next.from.getTime(), range.from.getTime())
    assert.equal(next.to.getTime(), range.to.getTime())
  })
})

describe("listYearMonths", () => {
  it("includes both range endpoints", () => {
    const months = listYearMonths(new Date(2026, 10, 1), new Date(2027, 0, 1))
    assert.deepEqual(months, [
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
    ])
  })
})

describe("monthKey", () => {
  it("pads the month and round-trips", () => {
    assert.equal(monthKey(2026, 9), "2026-09")
    assert.deepEqual(parseMonthKey("2026-09"), { year: 2026, month: 9 })
  })
})

describe("isoMonthBounds", () => {
  it("uses inclusive calendar days", () => {
    assert.deepEqual(isoMonthBounds(2026, 9), {
      dateFrom: "2026-09-01",
      dateTo: "2026-09-30",
    })
    assert.deepEqual(isoMonthBounds(2026, 2), {
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
    })
    assert.deepEqual(isoMonthBounds(2026, 10), {
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    })
  })
})

describe("intersectIsoDateRange", () => {
  it("clips a year window to filter dates", () => {
    assert.deepEqual(
      intersectIsoDateRange({
        windowFrom: "2026-01-01",
        windowTo: "2026-12-31",
        filterFrom: "2026-03-01",
        filterTo: "2026-03-31",
      }),
      { dateFrom: "2026-03-01", dateTo: "2026-03-31" }
    )
    assert.equal(
      intersectIsoDateRange({
        windowFrom: "2025-01-01",
        windowTo: "2025-12-31",
        filterFrom: "2026-03-01",
        filterTo: "2026-03-31",
      }),
      null
    )
  })
})

describe("previousMonthsBounds", () => {
  it("covers the three full months before October 2026", () => {
    assert.deepEqual(previousMonthsBounds(new Date(2026, 9, 11), 3), {
      dateFrom: "2026-07-01",
      dateTo: "2026-09-30",
    })
  })
})
