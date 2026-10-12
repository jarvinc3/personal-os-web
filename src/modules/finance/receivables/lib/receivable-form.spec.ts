import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { receivableSchema } from "./receivable-form.ts"

const validReceivable = {
  debtorName: "Ana",
  description: "",
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

  it("rejects an unknown status", () => {
    assert.equal(
      receivableSchema.safeParse({ ...validReceivable, status: "NOPE" })
        .success,
      false
    )
  })
})
