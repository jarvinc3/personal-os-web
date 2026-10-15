import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { FinanceAccount, FinanceCard } from "../types/entities.ts"
import {
  canManageCardBalances,
  resolveCardDisplayBalances,
} from "./card-balances.ts"

const account = {
  id: "account-1",
  currency: "DOP",
  balance: "24500",
} as FinanceAccount

function card(overrides: Partial<FinanceCard>): FinanceCard {
  return {
    id: "card-1",
    institutionId: "institution-1",
    institutionName: "Banco",
    accountId: null,
    accountName: null,
    name: "Tarjeta",
    type: "CREDIT",
    network: "VISA",
    lastFour: "4242",
    statementClosingDay: null,
    paymentDueDay: null,
    nextStatementDate: null,
    nextPaymentDueDate: null,
    color: null,
    isActive: true,
    balances: [],
    ...overrides,
  }
}

describe("resolveCardDisplayBalances", () => {
  it("inherits the linked account balance for a debit card", () => {
    const result = resolveCardDisplayBalances(
      card({
        type: "DEBIT",
        accountId: account.id,
        balances: [
          {
            id: "stale",
            currency: "USD",
            balance: "1",
            creditLimit: null,
            availableCredit: null,
          },
        ],
      }),
      [account]
    )

    assert.deepEqual(result, [
      { id: account.id, currency: "DOP", balance: "24500" },
    ])
  })

  it("keeps card balances for a credit card", () => {
    const balance = {
      id: "balance-1",
      currency: "USD",
      balance: "200",
      creditLimit: "1000",
      availableCredit: "1000",
    }
    assert.deepEqual(
      resolveCardDisplayBalances(card({ balances: [balance] }), [account]),
      [balance]
    )
  })
})

describe("canManageCardBalances", () => {
  it("disables card balance management for debit cards", () => {
    assert.equal(canManageCardBalances(card({ type: "DEBIT" })), false)
    assert.equal(canManageCardBalances(card({ type: "CREDIT" })), true)
  })
})
