import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { budgetSchema } from "./budget-form.ts"

const validBudget = {
  categoryIds: ["cat-1"],
  periodType: "MONTHLY" as const,
  periodStart: "2026-01-01",
  periodEnd: "2026-01-31",
  amountLimit: "100",
  alertThresholdPct: "80",
  includeChildren: true,
  rollover: "NONE" as const,
  recurring: false,
}

describe("budgetSchema", () => {
  it("accepts a monthly budget", () => {
    assert.equal(budgetSchema.safeParse(validBudget).success, true)
  })

  it("accepts several categories", () => {
    assert.equal(
      budgetSchema.safeParse({
        ...validBudget,
        categoryIds: ["cat-1", "cat-2"],
      }).success,
      true
    )
  })

  it("rejects an empty category set", () => {
    assert.equal(
      budgetSchema.safeParse({ ...validBudget, categoryIds: [] }).success,
      false
    )
  })

  it("rejects an empty amount limit", () => {
    assert.equal(
      budgetSchema.safeParse({ ...validBudget, amountLimit: "" }).success,
      false
    )
  })
})
