import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { savingsGoalSchema } from "./savings-goal-form.ts"

const validGoal = {
  name: "Viaje",
  description: "",
  targetAmount: "2000",
  currentAmount: "0",
  currency: "EUR",
  targetDate: "",
}

describe("savingsGoalSchema", () => {
  it("accepts a goal with a target amount", () => {
    assert.equal(savingsGoalSchema.safeParse(validGoal).success, true)
  })

  it("rejects an empty target amount", () => {
    assert.equal(
      savingsGoalSchema.safeParse({ ...validGoal, targetAmount: "" }).success,
      false
    )
  })
})
