import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { accountSchema } from "./account-form.ts"

const validCashAccount = {
  name: "Efectivo",
  type: "CASH" as const,
  currency: "EUR",
  institutionId: "",
  accountNumber: "",
  color: "",
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
})
