import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  formatClockTimeFromDate,
  formatDayHeaderLabel,
  formatDayMonth,
  formatDayMonthYear,
  formatMonthYearLabel,
  formatShortClockTime,
  formatTimeForDisplay,
  formatTimeRange,
  shortMonthLabel,
} from "./date-format.ts"

const ES = "es-DO"
const EN = "en-US"

describe("formatTimeForDisplay", () => {
  it("renders API HH:mm as 12-hour time in the profile locale", () => {
    assert.equal(formatTimeForDisplay("08:00", ES), "08:00 a.m.")
    assert.equal(formatTimeForDisplay("18:00", ES), "06:00 p.m.")
    assert.equal(formatTimeForDisplay("00:00", ES), "12:00 a.m.")
    assert.equal(formatTimeForDisplay("12:00", ES), "12:00 p.m.")
    assert.equal(formatTimeForDisplay("18:00", EN), "06:00 p.m.")
  })
})

describe("formatShortClockTime", () => {
  it("drops the leading zero of the hour", () => {
    assert.equal(formatShortClockTime("09:05", ES), "9:05 a. m.")
    assert.equal(formatShortClockTime("14:30", ES), "2:30 p. m.")
  })
})

describe("formatTimeRange", () => {
  it("joins start and end in the locale of the profile", () => {
    assert.equal(
      formatTimeRange({ start: "22:00", end: "08:00", locale: ES }),
      "10:00 p.m. – 08:00 a.m."
    )
  })
})

describe("formatClockTimeFromDate", () => {
  it("formats a Date in 12-hour time", () => {
    assert.equal(
      formatClockTimeFromDate(new Date(2026, 9, 5, 9, 5), ES),
      "09:05 a.m."
    )
  })
})

describe("day and month labels", () => {
  it("keeps the Spanish abbreviations of the month", () => {
    const september = new Date(2026, 8, 18)
    assert.equal(shortMonthLabel(september, ES), "sep")
    assert.equal(formatDayMonth(september, ES), "18 sep")
    assert.equal(formatDayMonthYear(september, ES), "18 sep 2026")
  })

  it("follows the locale of the profile", () => {
    const september = new Date(2026, 8, 18)
    assert.equal(formatDayMonthYear(september, EN), "18 sep 2026")
    assert.equal(formatMonthYearLabel(september, ES), "Septiembre 2026")
    assert.equal(formatMonthYearLabel(september, EN), "September 2026")
    assert.equal(
      formatDayHeaderLabel(new Date(2026, 9, 14), ES),
      "Miércoles 14 Oct."
    )
    assert.equal(
      formatDayHeaderLabel(new Date(2026, 9, 14), EN),
      "Wednesday 14 Oct."
    )
  })
})
