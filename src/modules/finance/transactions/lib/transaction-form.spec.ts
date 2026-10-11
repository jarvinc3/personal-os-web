import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { transactionSchema } from "./transaction-form.ts"

const validTransaction = {
  type: "DEBIT" as const,
  amount: "10",
  currency: "EUR",
  transactionDate: "2026-01-01T09:15",
  destination: "account:acc-1",
  categoryId: "",
  status: "CONFIRMED" as const,
  merchant: "",
  description: "",
  notes: "",
}

describe("transactionSchema", () => {
  it("accepts a positive amount and a ledger target", () => {
    assert.equal(transactionSchema.safeParse(validTransaction).success, true)
  })

  it("rejects a zero amount", () => {
    assert.equal(
      transactionSchema.safeParse({ ...validTransaction, amount: "0" }).success,
      false
    )
  })

  it("requires a date and an hour", () => {
    assert.equal(
      transactionSchema.safeParse({
        ...validTransaction,
        transactionDate: "2026-01-01",
      }).success,
      false
    )
  })
})
