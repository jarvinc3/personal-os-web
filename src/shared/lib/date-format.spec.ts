import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  formatClockTimeFromDate,
  formatTimeForDisplay,
  formatTimeRange,
} from "./date-format.ts"

describe("formatTimeForDisplay", () => {
  it("renders API HH:mm as 12-hour Spanish time", () => {
    assert.equal(formatTimeForDisplay("08:00"), "08:00 a.m.")
    assert.equal(formatTimeForDisplay("18:00"), "06:00 p.m.")
    assert.equal(formatTimeForDisplay("00:00"), "12:00 a.m.")
    assert.equal(formatTimeForDisplay("12:00"), "12:00 p.m.")
  })
})

describe("formatTimeRange", () => {
  it("joins start and end in 12-hour format", () => {
    assert.equal(formatTimeRange("22:00", "08:00"), "10:00 p.m. – 08:00 a.m.")
  })
})

describe("formatClockTimeFromDate", () => {
  it("formats a Date in 12-hour Spanish time", () => {
    assert.equal(
      formatClockTimeFromDate(new Date(2026, 9, 5, 9, 5)),
      "09:05 a.m."
    )
  })
})
