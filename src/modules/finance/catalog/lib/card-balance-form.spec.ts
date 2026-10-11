import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { cardBalanceSchema } from "./card-balance-form.ts"

describe("cardBalanceSchema", () => {
  it("accepts a currency and balance", () => {
    assert.equal(
      cardBalanceSchema.safeParse({
        currency: "EUR",
        balance: "0",
        creditLimit: "",
      }).success,
      true
    )
  })

  it("rejects a currency shorter than three characters", () => {
    assert.equal(
      cardBalanceSchema.safeParse({
        currency: "EU",
        balance: "0",
        creditLimit: "",
      }).success,
      false
    )
  })
})
