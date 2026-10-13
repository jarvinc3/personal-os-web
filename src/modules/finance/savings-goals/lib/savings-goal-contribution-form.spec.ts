import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { savingsGoalContributionSchema } from "./savings-goal-contribution-form.ts"

describe("savingsGoalContributionSchema", () => {
  it("accepts an amount with a source account", () => {
    assert.equal(
      savingsGoalContributionSchema.safeParse({
        amount: "25",
        accountId: "acc-1",
        kind: "CONTRIBUTION",
        contributedAt: "",
        notes: "",
      }).success,
      true
    )
  })

  it("rejects a contribution without an account", () => {
    assert.equal(
      savingsGoalContributionSchema.safeParse({
        amount: "25",
        accountId: "  ",
        kind: "CONTRIBUTION",
        contributedAt: "",
        notes: "",
      }).success,
      false
    )
  })

  it("rejects an empty amount", () => {
    assert.equal(
      savingsGoalContributionSchema.safeParse({
        amount: "   ",
        accountId: "acc-1",
        kind: "CONTRIBUTION",
        contributedAt: "",
        notes: "",
      }).success,
      false
    )
  })
})
