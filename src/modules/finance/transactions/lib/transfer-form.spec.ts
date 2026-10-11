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
})
