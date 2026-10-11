import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { savingsGoalContributionSchema } from "./savings-goal-contribution-form.ts"

describe("savingsGoalContributionSchema", () => {
  it("accepts an amount", () => {
    assert.equal(
      savingsGoalContributionSchema.safeParse({
        amount: "25",
        contributedAt: "",
        notes: "",
      }).success,
      true
    )
  })

  it("rejects an empty amount", () => {
    assert.equal(
      savingsGoalContributionSchema.safeParse({
        amount: "   ",
        contributedAt: "",
        notes: "",
      }).success,
      false
    )
  })
})
