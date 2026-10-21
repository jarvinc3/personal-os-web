import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceCard } from "@/src/modules/finance/shared/types/entities"
import { toCardFormValues } from "./card-form-values.ts"

describe("toCardFormValues", () => {
  it("starts a credit card with an empty balance in the default currency", () => {
    const values = toCardFormValues({
      card: null,
      defaultCurrency: "USD",
      defaultInstitutionId: "institution-1",
    })

    assert.equal(values.name, "")
    assert.equal(values.type, "CREDIT")
    assert.equal(values.institutionId, "institution-1")
    assert.equal(values.accountId, CATALOG_NONE)
    assert.equal(values.network, "VISA")
    assert.equal(values.statementClosingDay, "")
    assert.deepEqual(values.balances, [
      { currency: "USD", balance: "", creditLimit: "" },
    ])
  })

  it("reads the card, its cycle days and the first balance currency", () => {
    const values = toCardFormValues({
      card: {
        name: "Visa principal",
        type: "DEBIT",
        institutionId: "institution-2",
        accountId: "account-3",
        network: "MASTERCARD",
        lastFour: "1234",
        statementClosingDay: 15,
        paymentDueDay: 25,
        color: "#112233",
        balances: [{ currency: "DOP", availableCredit: "100.00" }],
      } as FinanceCard,
      defaultCurrency: "USD",
      defaultInstitutionId: "institution-1",
    })

    assert.equal(values.name, "Visa principal")
    assert.equal(values.type, "DEBIT")
    assert.equal(values.institutionId, "institution-2")
    assert.equal(values.accountId, "account-3")
    assert.equal(values.network, "MASTERCARD")
    assert.equal(values.lastFour, "1234")
    assert.equal(values.statementClosingDay, "15")
    assert.equal(values.paymentDueDay, "25")
    assert.equal(values.color, "#112233")
    assert.deepEqual(values.balances, [
      { currency: "DOP", balance: "", creditLimit: "" },
    ])
  })
})
