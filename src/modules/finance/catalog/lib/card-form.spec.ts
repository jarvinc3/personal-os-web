import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { cardSchema } from "./card-form.ts"

const validCard = {
  name: "Visa",
  type: "CREDIT" as const,
  institutionId: "inst-1",
  accountId: "",
  network: "VISA",
  lastFour: "1234",
  statementClosingDay: "",
  paymentDueDay: "",
  color: "",
  balances: [],
}

describe("cardSchema", () => {
  it("accepts a card with four-digit last digits", () => {
    assert.equal(cardSchema.safeParse(validCard).success, true)
  })

  it("rejects last digits that are not four digits", () => {
    assert.equal(
      cardSchema.safeParse({ ...validCard, lastFour: "12" }).success,
      false
    )
  })

  it("rejects a credit row with an invalid balance", () => {
    assert.equal(
      cardSchema.safeParse({
        ...validCard,
        balances: [{ currency: "DOP", balance: "abc", creditLimit: "" }],
      }).success,
      false
    )
  })

  it("rejects a credit row with a balance but no limit", () => {
    assert.equal(
      cardSchema.safeParse({
        ...validCard,
        balances: [{ currency: "DOP", balance: "100", creditLimit: "" }],
      }).success,
      false
    )
  })
})
