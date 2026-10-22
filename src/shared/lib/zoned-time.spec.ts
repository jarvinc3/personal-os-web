import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  instantToZonedDate,
  instantToZonedWallTime,
  zonedMonthEnd,
  zonedMonthStart,
  zonedWallTimeToInstant,
} from "./zoned-time.ts"

const LA_PAZ = "America/La_Paz"

describe("zonedWallTimeToInstant", () => {
  it("reads the wall clock in the user's zone", () => {
    assert.equal(
      zonedWallTimeToInstant("2026-10-21T13:02", LA_PAZ),
      "2026-10-21T17:02:00.000Z"
    )
  })

  it("resolves the offset on the other side of a DST change", () => {
    assert.equal(
      zonedWallTimeToInstant("2026-03-08T01:30", "America/New_York"),
      "2026-03-08T06:30:00.000Z"
    )
    assert.equal(
      zonedWallTimeToInstant("2026-03-08T03:30", "America/New_York"),
      "2026-03-08T07:30:00.000Z"
    )
  })

  it("fails loudly on a value that is not a wall clock", () => {
    assert.throws(() => zonedWallTimeToInstant("2026-10-21", LA_PAZ))
    assert.throws(() =>
      zonedWallTimeToInstant("2026-10-21T13:02:00.000Z", LA_PAZ)
    )
  })
})

describe("instantToZonedWallTime", () => {
  it("shows the instant as the wall clock of the zone", () => {
    assert.equal(
      instantToZonedWallTime("2026-10-21T17:02:00.000Z", LA_PAZ),
      "2026-10-21T13:02"
    )
  })

  it("keeps the day the user sees at midnight", () => {
    assert.equal(
      instantToZonedWallTime("2026-11-01T02:30:00.000Z", LA_PAZ),
      "2026-10-31T22:30"
    )
    assert.equal(
      instantToZonedDate("2026-11-01T02:30:00.000Z", LA_PAZ),
      "2026-10-31"
    )
  })

  it("returns the value untouched when it is not a date", () => {
    assert.equal(instantToZonedWallTime("not-a-date", LA_PAZ), "not-a-date")
    assert.equal(instantToZonedDate("not-a-date", LA_PAZ), "not-a-date")
  })
})

describe("zonedMonthStart and zonedMonthEnd", () => {
  it("bounds an October in the user's zone", () => {
    assert.equal(zonedMonthStart(2026, 10, LA_PAZ), "2026-10-01T04:00:00.000Z")
    assert.equal(zonedMonthEnd(2026, 10, LA_PAZ), "2026-11-01T03:59:00.000Z")
  })

  it("bounds February of a leap year", () => {
    assert.equal(
      instantToZonedDate(zonedMonthEnd(2028, 2, LA_PAZ), LA_PAZ),
      "2028-02-29"
    )
  })
})
