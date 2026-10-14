import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { nextChargeLabel, recurringFrequencyLabel } from "./recurring-display.ts"

describe("recurringFrequencyLabel", () => {
  it("names every supported periodicity", () => {
    assert.equal(recurringFrequencyLabel(7), "Semanal")
    assert.equal(recurringFrequencyLabel(30), "Mensual")
    assert.equal(recurringFrequencyLabel(365), "Anual")
  })
})

describe("nextChargeLabel", () => {
  it("counts up when the charge is ahead", () => {
    assert.equal(nextChargeLabel(0), "Hoy")
    assert.equal(nextChargeLabel(1), "Mañana")
    assert.equal(nextChargeLabel(4), "En 4 días")
  })

  it("counts down when the charge is late", () => {
    assert.equal(nextChargeLabel(-1), "Hace 1 día")
    assert.equal(nextChargeLabel(-3), "Hace 3 días")
  })
})
