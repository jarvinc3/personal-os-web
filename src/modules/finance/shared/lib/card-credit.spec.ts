import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { countdownLabel, daysUntilIsoDate } from "./card-credit.ts"

describe("daysUntilIsoDate", () => {
  const now = new Date(2026, 1, 12, 9, 30)

  it("counts whole days to the target date", () => {
    assert.equal(daysUntilIsoDate("2026-02-15", now), 3)
    assert.equal(daysUntilIsoDate("2026-02-12", now), 0)
    assert.equal(daysUntilIsoDate("2026-02-10", now), -2)
  })

  it("returns null without a valid date", () => {
    assert.equal(daysUntilIsoDate(null, now), null)
    assert.equal(daysUntilIsoDate("", now), null)
    assert.equal(daysUntilIsoDate("nope", now), null)
  })
})

describe("countdownLabel", () => {
  it("labels overdue, today, tomorrow and later", () => {
    assert.equal(countdownLabel(-2), "Vencido hace 2 días")
    assert.equal(countdownLabel(-1), "Vencido hace 1 día")
    assert.equal(countdownLabel(0), "Vence hoy")
    assert.equal(countdownLabel(1), "Vence mañana")
    assert.equal(countdownLabel(5), "Vence en 5 días")
    assert.equal(countdownLabel(null), null)
  })
})
