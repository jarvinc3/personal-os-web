import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { receivablePaymentSchema } from "./receivable-payment-form.ts"

describe("receivablePaymentSchema", () => {
  it("accepts an amount and account", () => {
    assert.equal(
      receivablePaymentSchema.safeParse({
        amount: "50",
        accountId: "acc-1",
        paidAt: "",
      }).success,
      true
    )
  })

  it("rejects an empty amount", () => {
    assert.equal(
      receivablePaymentSchema.safeParse({
        amount: "",
        accountId: "acc-1",
        paidAt: "",
      }).success,
      false
    )
  })
})
