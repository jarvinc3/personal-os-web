import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  budgetPctUsed,
  buildCreateBudgetBody,
  monthPeriodBounds,
} from "./budget-payloads.ts"

describe("buildCreateBudgetBody", () => {
  it("sends amountLimit as a number, not a money string", () => {
    const result = buildCreateBudgetBody({
      categoryId: "cat-1",
      periodType: "MONTHLY",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      amountLimit: "100.50",
      alertThresholdPct: "80",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(typeof result.body.amountLimit, "number")
    assert.equal(result.body.amountLimit, 100.5)
    assert.equal(typeof result.body.alertThresholdPct, "number")
    assert.equal(result.body.alertThresholdPct, 80)
    assert.equal(JSON.stringify(result.body).includes('"100.50"'), false)
    assert.equal("amountSpent" in result.body, false)
  })

  it("rejects missing category, inverted dates, and NaN money", () => {
    assert.equal(
      buildCreateBudgetBody({
        periodType: "MONTHLY",
        periodStart: "2026-09-01",
        periodEnd: "2026-09-30",
        amountLimit: "10",
      }).ok,
      false,
    )
    assert.equal(
      buildCreateBudgetBody({
        categoryId: "cat-1",
        periodType: "CUSTOM",
        periodStart: "2026-09-30",
        periodEnd: "2026-09-01",
        amountLimit: "10",
      }).ok,
      false,
    )
    assert.equal(
      buildCreateBudgetBody({
        categoryId: "cat-1",
        periodType: "MONTHLY",
        periodStart: "2026-09-01",
        periodEnd: "2026-09-30",
        amountLimit: "nope",
      }).ok,
      false,
    )
  })

  it("rejects alert thresholds outside the 0 to 100 range", () => {
    const baseInput = {
      categoryId: "cat-1",
      periodType: "MONTHLY",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-30",
      amountLimit: "1290",
    }

    assert.deepEqual(
      buildCreateBudgetBody({ ...baseInput, alertThresholdPct: "1200" }),
      { ok: false, error: "El umbral debe estar entre 0 y 100" },
    )
    assert.deepEqual(
      buildCreateBudgetBody({ ...baseInput, alertThresholdPct: "-1" }),
      { ok: false, error: "El umbral debe estar entre 0 y 100" },
    )
  })
})

describe("budgetPctUsed", () => {
  it("computes a number from money strings without treating the list as an array", () => {
    assert.equal(budgetPctUsed("25", "100"), 25)
    assert.equal(budgetPctUsed("0", "50"), 0)
    assert.equal(budgetPctUsed("10", "0"), null)
  })
})

describe("monthPeriodBounds", () => {
  it("uses calendar month bounds", () => {
    const bounds = monthPeriodBounds(new Date(2026, 8, 15))
    assert.equal(bounds.periodStart, "2026-09-01")
    assert.equal(bounds.periodEnd, "2026-09-30")
  })
})
