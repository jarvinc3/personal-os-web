import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  countdownLabel,
  daysUntilIsoDate,
  nextCycleNote,
} from "./card-credit.ts"

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

describe("nextCycleNote", () => {
  const now = new Date(2026, 1, 12, 9, 30)

  it("joins the next closing and the payment countdown", () => {
    const note = nextCycleNote({
      card: {
        nextStatementDate: "2026-02-28",
        nextPaymentDueDate: "2026-02-15",
      },
      locale: "es-DO",
      now,
    })
    assert.ok(note)
    assert.match(note, /Próximo corte/)
    assert.match(note, /Vence en 3 días/)
  })

  it("keeps only the countdown when the card has no closing date", () => {
    assert.equal(
      nextCycleNote({
        card: { nextStatementDate: null, nextPaymentDueDate: "2026-02-15" },
        locale: "es-DO",
        now,
      }),
      "Vence en 3 días"
    )
  })

  it("returns null without any projected date", () => {
    assert.equal(
      nextCycleNote({
        card: { nextStatementDate: null, nextPaymentDueDate: null },
        locale: "es-DO",
        now,
      }),
      null
    )
  })
})
