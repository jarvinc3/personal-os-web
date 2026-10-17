import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { receivableSchema } from "./receivable-form.ts"

const validReceivable = {
  debtorName: "Ana",
  description: "Préstamo",
  amount: "100",
  paidAmount: "0",
  status: "PENDING" as const,
  currency: "EUR",
  dueDate: "",
}

describe("receivableSchema", () => {
  it("accepts a pending receivable", () => {
    assert.equal(receivableSchema.safeParse(validReceivable).success, true)
  })

  it("rejects a cobro without concept", () => {
    assert.equal(
      receivableSchema.safeParse({ ...validReceivable, description: "  " })
        .success,
      false
    )
  })

  it("rejects a concept longer than the API bound", () => {
    assert.equal(
      receivableSchema.safeParse({
        ...validReceivable,
        description: "C".repeat(121),
      }).success,
      false
    )
  })

  it("rejects an unknown status", () => {
    assert.equal(
      receivableSchema.safeParse({ ...validReceivable, status: "NOPE" })
        .success,
      false
    )
  })
})
