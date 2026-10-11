import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { budgetSchema } from "./budget-form.ts"

const validBudget = {
  categoryId: "cat-1",
  periodType: "MONTHLY" as const,
  periodStart: "2026-01-01",
  periodEnd: "2026-01-31",
  amountLimit: "100",
  alertThresholdPct: "80",
}

describe("budgetSchema", () => {
  it("accepts a monthly budget", () => {
    assert.equal(budgetSchema.safeParse(validBudget).success, true)
  })

  it("rejects an empty amount limit", () => {
    assert.equal(
      budgetSchema.safeParse({ ...validBudget, amountLimit: "" }).success,
      false
    )
  })
})
