import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { FinanceAccount, FinanceCard } from "../types/entities.ts"
import {
  canManageCardBalances,
  cardCreditFacts,
  cardDisplayAmount,
  cardUtilization,
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

describe("cardDisplayAmount", () => {
  it("shows the available credit, not the debt, for a credit card", () => {
    assert.equal(
      cardDisplayAmount({
        id: "balance-1",
        currency: "DOP",
        balance: "-22526.58",
        creditLimit: "62000.00",
        availableCredit: "-22526.58",
      }),
      -22526.58
    )
  })

  it("keeps a positive available credit as it comes", () => {
    assert.equal(
      cardDisplayAmount({
        id: "balance-1",
        currency: "DOP",
        balance: "0.00",
        creditLimit: "62000.00",
        availableCredit: "39500.00",
      }),
      39500
    )
  })

  it("shows the balance of a debit card", () => {
    assert.equal(
      cardDisplayAmount({
        id: "balance-1",
        currency: "DOP",
        balance: "24500",
      }),
      24500
    )
  })

  it("returns null for a value that cannot be read", () => {
    assert.equal(
      cardDisplayAmount({
        id: "balance-1",
        currency: "DOP",
        balance: "abc",
      }),
      null
    )
  })
})

describe("cardUtilization", () => {
  it("uses part of the limit when there is debt left", () => {
    const utilization = cardUtilization({ available: 3000, creditLimit: 10000 })
    assert.ok(utilization !== null)
    assert.equal(utilization.debt, 7000)
    assert.equal(utilization.utilizationPct, 70)
    assert.equal(utilization.overdraft, 0)
  })

  it("goes past 100% when the card owes more than its limit", () => {
    const utilization = cardUtilization({
      available: -2500.5,
      creditLimit: 10000,
    })
    assert.ok(utilization !== null)
    assert.equal(utilization.debt, 12500.5)
    assert.ok(Math.abs(utilization.utilizationPct - 125.005) < 1e-9)
    assert.equal(utilization.overdraft, 2500.5)
  })

  it("returns null without a usable limit", () => {
    assert.equal(cardUtilization({ available: 0, creditLimit: 0 }), null)
    assert.equal(cardUtilization({ available: 500, creditLimit: -1 }), null)
  })
})

describe("cardCreditFacts", () => {
  it("explains a fully used card with debt, limit and available", () => {
    const facts = cardCreditFacts({
      id: "balance-1",
      currency: "DOP",
      balance: "0",
      creditLimit: "100000.00",
      availableCredit: "0.00",
    })

    assert.ok(facts !== null)
    assert.equal(facts.debt, 100000)
    assert.equal(facts.creditLimit, 100000)
    assert.equal(facts.available, 0)
    assert.equal(facts.utilizationPct, 100)
  })

  it("reports no debt when the whole limit is available", () => {
    const facts = cardCreditFacts({
      id: "balance-1",
      currency: "DOP",
      balance: "0",
      creditLimit: "50000.00",
      availableCredit: "50000.00",
    })

    assert.ok(facts !== null)
    assert.equal(facts.debt, 0)
    assert.equal(facts.utilizationPct, 0)
  })

  it("returns null without a configured limit instead of inventing a debt", () => {
    assert.equal(
      cardCreditFacts({
        id: "balance-1",
        currency: "DOP",
        balance: "1200.00",
        creditLimit: null,
        availableCredit: null,
      }),
      null
    )
  })
})

describe("canManageCardBalances", () => {
  it("disables card balance management for debit cards", () => {
    assert.equal(canManageCardBalances(card({ type: "DEBIT" })), false)
    assert.equal(canManageCardBalances(card({ type: "CREDIT" })), true)
  })
})
