import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { cardSchema, institutionAccountOptions } from "./card-form.ts"
import type { FinanceAccount } from "../types/entities.ts"

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

function account(
  partial: Partial<FinanceAccount> & Pick<FinanceAccount, "id" | "name">
): FinanceAccount {
  return {
    institutionId: "inst-1",
    institutionName: "Banco",
    type: "CHECKING",
    currency: "DOP",
    accountNumberLast4: null,
    balance: "0",
    color: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  }
}

describe("institutionAccountOptions", () => {
  it("keeps only the accounts of the card institution", () => {
    const options = institutionAccountOptions(
      [
        account({ id: "acc-1", name: "Ahorros", institutionId: "inst-1" }),
        account({ id: "acc-2", name: "Corriente", institutionId: "inst-2" }),
      ],
      "inst-1"
    )

    assert.deepEqual(
      options.map((option) => option.id),
      ["acc-1"]
    )
  })

  it("drops inactive accounts of the institution", () => {
    const options = institutionAccountOptions(
      [
        account({ id: "acc-1", name: "Ahorros" }),
        account({ id: "acc-2", name: "Cerrada", isActive: false }),
      ],
      "inst-1"
    )

    assert.deepEqual(
      options.map((option) => option.id),
      ["acc-1"]
    )
  })

  it("offers nothing when the institution has no accounts", () => {
    const options = institutionAccountOptions(
      [account({ id: "acc-1", name: "Ahorros", institutionId: "inst-2" })],
      "inst-1"
    )

    assert.equal(options.length, 0)
  })
})
