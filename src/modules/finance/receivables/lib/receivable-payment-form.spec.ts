import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canRegisterReceivablePayment,
  receivablePaymentSchema,
} from "./receivable-payment-form.ts"

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

describe("canRegisterReceivablePayment", () => {
  it("allows a pending and a fully paid receivable", () => {
    assert.equal(canRegisterReceivablePayment("PENDING"), true)
    assert.equal(canRegisterReceivablePayment("PAID"), true)
  })

  it("blocks a cancelled or written off receivable", () => {
    assert.equal(canRegisterReceivablePayment("CANCELLED"), false)
    assert.equal(canRegisterReceivablePayment("WRITTEN_OFF"), false)
  })
})
