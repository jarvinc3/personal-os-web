import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  formatRatePercentLabel,
  percentToRateFraction,
  rateFractionToPercent,
} from "./interest-rate.ts"

describe("percentToRateFraction", () => {
  it('converts UI 12% to API fraction 0.12 (number, not 12)', () => {
    const result = percentToRateFraction("12")
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.interestRate, 0.12)
    assert.equal(typeof result.interestRate, "number")
    assert.notEqual(result.interestRate, 12)
  })

  it("omits empty input (null ≠ 0)", () => {
    const result = percentToRateFraction("  ")
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal("interestRate" in result, false)
  })

  it("sends 0 for 0%", () => {
    const result = percentToRateFraction("0")
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.interestRate, 0)
  })

  it("rejects percent above 100", () => {
    const result = percentToRateFraction("120")
    assert.equal(result.ok, false)
  })
})

describe("rateFractionToPercent", () => {
  it('shows API "0.12" as 12, not as 0.12%', () => {
    assert.equal(rateFractionToPercent("0.12"), "12")
    assert.equal(formatRatePercentLabel("0.12"), "12%")
    assert.notEqual(formatRatePercentLabel("0.12"), "0.12%")
  })

  it("keeps null distinct from zero", () => {
    assert.equal(rateFractionToPercent(null), null)
    assert.equal(formatRatePercentLabel(null), "Sin tasa")
    assert.equal(rateFractionToPercent("0"), "0")
    assert.equal(formatRatePercentLabel("0"), "0%")
  })
})
