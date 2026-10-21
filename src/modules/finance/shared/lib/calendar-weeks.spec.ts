import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { formatClippedWeekLabel, weeksForMonth as weeksForMonthAt } from "./calendar-weeks.ts"

function weeksForMonth(year: number, month: number) {
  return weeksForMonthAt({ year, month, weekStartsOn: 0 })
}

describe("weeksForMonth", () => {
  it("clips April 2026 from Wednesday 1 to Saturday 4 on the first week", () => {
    const weeks = weeksForMonth(2026, 4)
    assert.equal(weeks[0]?.label, "mie 1 - sab 4")
    assert.equal(weeks.at(-1)?.label, "dom 26 - jue 30")
    for (const week of weeks) {
      assert.equal(week.start.getMonth(), week.end.getMonth())
      assert.equal(week.start.getFullYear(), 2026)
      assert.equal(week.start.getMonth(), 3)
    }
  })

  it("keeps a full first week when February 2026 starts on Sunday", () => {
    const weeks = weeksForMonth(2026, 2)
    assert.equal(weeks[0]?.label, "dom 1 - sab 7")
    for (const week of weeks) {
      assert.equal(week.start.getMonth(), week.end.getMonth())
    }
  })

  it("clips October 2026 from Thursday 1 to Saturday 3", () => {
    const weeks = weeksForMonth(2026, 10)
    assert.equal(weeks[0]?.label, "jue 1 - sab 3")
    for (const week of weeks) {
      assert.equal(week.start.getMonth(), week.end.getMonth())
    }
  })

  it("starts the week on Monday when the profile asks for it", () => {
    const weeks = weeksForMonthAt({
      year: 2026,
      month: 4,
      weekStartsOn: 1,
    })
    assert.equal(weeks[0]?.label, "mie 1 - dom 5")
  })
})

describe("formatClippedWeekLabel", () => {
  it("uses unaccented three-letter weekdays", () => {
    const start = new Date(2026, 3, 1)
    const end = new Date(2026, 3, 4)
    assert.equal(formatClippedWeekLabel(start, end), "mie 1 - sab 4")
  })
})
