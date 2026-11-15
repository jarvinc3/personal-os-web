import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { accountSchemaFor } from "./account-form.ts"

const accountSchema = accountSchemaFor({ isEdit: false })
const editAccountSchema = accountSchemaFor({ isEdit: true })

const validCashAccount = {
  name: "Efectivo",
  type: "CASH" as const,
  currency: "EUR",
  institutionId: "",
  accountNumber: "",
  color: "",
  initialBalance: "",
  isDefaultForInstitution: false,
}

describe("accountSchema", () => {
  it("accepts a cash account without institution or number", () => {
    assert.equal(accountSchema.safeParse(validCashAccount).success, true)
  })

  it("requires an institution for a non-cash account", () => {
    assert.equal(
      accountSchema.safeParse({ ...validCashAccount, type: "CHECKING" })
        .success,
      false
    )
  })

  it("rejects a bank account without a number on create", () => {
    assert.equal(
      accountSchema.safeParse({
        ...validCashAccount,
        type: "CHECKING",
        institutionId: "inst-1",
      }).success,
      false
    )
  })

  it("accepts only the four digits as the number on create", () => {
    assert.equal(
      accountSchema.safeParse({
        ...validCashAccount,
        type: "CHECKING",
        institutionId: "inst-1",
        accountNumber: "0016",
      }).success,
      true
    )
  })

  it("accepts an edit that keeps the stored number", () => {
    assert.equal(
      editAccountSchema.safeParse({
        ...validCashAccount,
        type: "CHECKING",
        institutionId: "inst-1",
      }).success,
      true
    )
  })

  it("rejects a short number on edit", () => {
    assert.equal(
      editAccountSchema.safeParse({
        ...validCashAccount,
        type: "CHECKING",
        institutionId: "inst-1",
        accountNumber: "12",
      }).success,
      false
    )
  })
})
