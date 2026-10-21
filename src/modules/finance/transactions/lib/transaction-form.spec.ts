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

  it("rejects an amount with more than two decimals", () => {
    const parsed = transactionSchema.safeParse({
      ...validTransaction,
      amount: "10.005",
    })
    assert.equal(parsed.success, false)
    assert.equal(
      parsed.error?.issues[0]?.message,
      "Monto con dos decimales como máximo"
    )
  })

  it("rejects an amount above the ceiling and names the maximum", () => {
    const parsed = transactionSchema.safeParse({
      ...validTransaction,
      amount: "99999999999",
    })
    assert.equal(parsed.success, false)
    assert.match(parsed.error?.issues[0]?.message ?? "", /^Monto máximo /)
  })

  it("accepts an amount with two decimals", () => {
    assert.equal(
      transactionSchema.safeParse({ ...validTransaction, amount: "10.05" })
        .success,
      true
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
