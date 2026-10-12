import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  cardBalanceSchema,
  cardBalanceSchemaWithLimit,
} from "./card-balance-form.ts"

describe("cardBalanceSchema", () => {
  it("accepts a currency and balance", () => {
    assert.equal(
      cardBalanceSchema.safeParse({
        currency: "EUR",
        balance: "0",
        creditLimit: "",
      }).success,
      true
    )
  })

  it("rejects a currency shorter than three characters", () => {
    assert.equal(
      cardBalanceSchema.safeParse({
        currency: "EU",
        balance: "0",
        creditLimit: "",
      }).success,
      false
    )
  })

  it("rejects a balance that is not a number", () => {
    assert.equal(
      cardBalanceSchema.safeParse({
        currency: "DOP",
        balance: "abc",
        creditLimit: "",
      }).success,
      false
    )
  })

  it("requires the limit when the card is a credit card", () => {
    assert.equal(
      cardBalanceSchemaWithLimit(true).safeParse({
        currency: "DOP",
        balance: "0",
        creditLimit: "",
      }).success,
      false
    )
  })
})
