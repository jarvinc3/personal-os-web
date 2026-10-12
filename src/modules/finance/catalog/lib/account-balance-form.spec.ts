import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { accountBalanceSchema } from "./account-balance-form.ts"

describe("accountBalanceSchema", () => {
  it("accepts a balance with digits", () => {
    assert.equal(
      accountBalanceSchema.safeParse({ balance: "125.50" }).success,
      true
    )
  })

  it("rejects a blank balance", () => {
    assert.equal(
      accountBalanceSchema.safeParse({ balance: "   " }).success,
      false
    )
  })

  it("rejects a balance that is not a number", () => {
    assert.equal(
      accountBalanceSchema.safeParse({ balance: "abc" }).success,
      false
    )
  })
})
