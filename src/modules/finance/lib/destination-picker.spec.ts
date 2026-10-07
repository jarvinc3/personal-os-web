import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildDestinationPickerGroups } from "./destination-picker.ts"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "../types/entities.ts"

function institution(
  partial: Partial<FinanceInstitution> & Pick<FinanceInstitution, "id" | "name">,
): FinanceInstitution {
  return {
    color: null,
    logoUrl: null,
    country: null,
    isActive: true,
    ...partial,
  }
}

function account(
  partial: Partial<FinanceAccount> & Pick<FinanceAccount, "id" | "name">,
): FinanceAccount {
  return {
    institutionId: null,
    institutionName: null,
    type: "CHECKING",
    currency: "DOP",
    accountNumber: null,
    balance: "0",
    color: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  }
}

function card(
  partial: Partial<FinanceCard> &
    Pick<FinanceCard, "id" | "name" | "institutionId">,
): FinanceCard {
  return {
    institutionName: "Bank",
    accountId: null,
    accountName: null,
    type: "CREDIT",
    network: "VISA",
    lastFour: "4321",
    statementClosingDay: null,
    paymentDueDay: null,
    color: null,
    isActive: true,
    balances: [{ id: "b1", currency: "DOP", balance: "0", creditLimit: null }],
    ...partial,
  }
}

describe("buildDestinationPickerGroups", () => {
  it("hides institutions without active accounts or cards", () => {
    const groups = buildDestinationPickerGroups({
      institutions: [
        institution({ id: "empty", name: "Vacío" }),
        institution({ id: "bank", name: "Banco", logoUrl: "logo.png" }),
      ],
      accounts: [account({ id: "a1", name: "Nómina", institutionId: "bank" })],
      cards: [],
    })
    assert.equal(groups.length, 1)
    assert.equal(groups[0]?.kind, "institution")
    if (groups[0]?.kind !== "institution") return
    assert.equal(groups[0].id, "bank")
    assert.equal(groups[0].logoUrl, "logo.png")
    assert.deepEqual(
      groups[0].accounts.map((item) => item.id),
      ["a1"],
    )
  })

  it("includes loose cash and keeps institutional cash inside the bank", () => {
    const groups = buildDestinationPickerGroups({
      institutions: [institution({ id: "bank", name: "Banco" })],
      accounts: [
        account({ id: "wallet", name: "Efectivo", type: "CASH" }),
        account({
          id: "drawer",
          name: "Caja banco",
          type: "CASH",
          institutionId: "bank",
        }),
      ],
      cards: [card({ id: "c1", name: "Visa", institutionId: "bank" })],
    })
    assert.deepEqual(
      groups.map((group) => group.kind),
      ["institution", "cash"],
    )
    const bank = groups[0]
    const cash = groups[1]
    if (bank?.kind !== "institution" || cash?.kind !== "cash") return
    assert.deepEqual(
      bank.accounts.map((item) => item.id),
      ["drawer"],
    )
    assert.equal(bank.cards[0]?.id, "c1")
    assert.equal(cash.account.id, "wallet")
  })

  it("does not take loans and skips inactive products", () => {
    const groups = buildDestinationPickerGroups({
      institutions: [
        institution({ id: "bank", name: "Banco" }),
        institution({ id: "closed", name: "Cerrado", isActive: false }),
      ],
      accounts: [
        account({
          id: "gone",
          name: "Inactiva",
          institutionId: "bank",
          isActive: false,
        }),
        account({
          id: "closed-account",
          name: "Cerrada",
          institutionId: "closed",
        }),
      ],
      cards: [
        card({
          id: "gone-card",
          name: "Inactiva",
          institutionId: "bank",
          isActive: false,
        }),
      ],
    })
    assert.deepEqual(groups, [])
  })
})
