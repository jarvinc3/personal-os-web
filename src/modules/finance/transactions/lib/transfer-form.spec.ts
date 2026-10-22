import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { transferSchema } from "./transfer-form.ts"

const validTransfer = {
  amount: "10",
  currency: "EUR",
  transactionDate: "2026-01-01T10:30",
  fromTarget: "account:acc-1",
  toTarget: "account:acc-2",
  status: "CONFIRMED" as const,
  destinationPending: false,
  rail: "" as const,
  feeAmount: "",
  exchangeRate: "",
  receivedAmount: "",
  description: "",
  notes: "",
}

describe("transferSchema", () => {
  it("accepts different origin and destination", () => {
    assert.equal(transferSchema.safeParse(validTransfer).success, true)
  })

  it("rejects the same origin and destination", () => {
    assert.equal(
      transferSchema.safeParse({
        ...validTransfer,
        toTarget: validTransfer.fromTarget,
      }).success,
      false
    )
  })

  it("requires a date and an hour", () => {
    assert.equal(
      transferSchema.safeParse({
        ...validTransfer,
        transactionDate: "2026-01-01",
      }).success,
      false
    )
  })

  it("accepts an empty fee but rejects a non-positive one", () => {
    assert.equal(
      transferSchema.safeParse({ ...validTransfer, feeAmount: "25" }).success,
      true
    )
    assert.equal(
      transferSchema.safeParse({ ...validTransfer, feeAmount: "0" }).success,
      false
    )
  })

  it("accepts a positive rate and received amount", () => {
    assert.equal(
      transferSchema.safeParse({
        ...validTransfer,
        exchangeRate: "77.6544",
        receivedAmount: "7765.44",
      }).success,
      true
    )
  })

  it("rejects a non-positive or over-precise rate", () => {
    assert.equal(
      transferSchema.safeParse({ ...validTransfer, exchangeRate: "0" }).success,
      false
    )
    assert.equal(
      transferSchema.safeParse({
        ...validTransfer,
        exchangeRate: "7.123456789",
      }).success,
      false
    )
  })

  it("rejects a non-positive received amount", () => {
    assert.equal(
      transferSchema.safeParse({ ...validTransfer, receivedAmount: "0" })
        .success,
      false
    )
  })
})
