import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { reconciliationProductHref } from "./reconciliation-links.ts"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"

const account: FinanceAccount = {
  id: "acc-1",
  institutionId: "inst-1",
  institutionName: "Banco",
  name: "Ahorros",
  type: "SAVINGS",
  currency: "DOP",
  accountNumberLast4: null,
  balance: "0",
  earmarkedAmount: "0",
  freeBalance: "0",
  color: null,
  isActive: true,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
}

const cashAccount: FinanceAccount = {
  ...account,
  id: "acc-cash",
  institutionId: null,
  institutionName: null,
  type: "CASH",
  name: "Efectivo",
}

const card: FinanceCard = {
  id: "card-1",
  institutionId: "inst-1",
  institutionName: "Banco",
  accountId: null,
  accountName: null,
  name: "Visa",
  type: "CREDIT",
  network: "VISA",
  lastFour: "1234",
  statementClosingDay: null,
  paymentDueDay: null,
  nextStatementDate: null,
  nextPaymentDueDate: null,
  color: null,
  isActive: true,
  balances: [],
}

const products = { accounts: [account, cashAccount], cards: [card] }

describe("reconciliationProductHref", () => {
  it("opens the reconciliation sheet of a bank account", () => {
    assert.equal(
      reconciliationProductHref({
        item: { kind: "account", accountId: "acc-1", cardId: null },
        ...products,
      }),
      "/finance/institutions/inst-1/accounts/acc-1?sheet=account-reconciliation-sheet"
    )
  })

  it("uses the cash route when the account has no institution", () => {
    assert.equal(
      reconciliationProductHref({
        item: { kind: "account", accountId: "acc-cash", cardId: null },
        ...products,
      }),
      "/finance/cash/acc-cash?sheet=account-reconciliation-sheet"
    )
  })

  it("opens the reconciliation sheet of a card", () => {
    assert.equal(
      reconciliationProductHref({
        item: { kind: "card", accountId: null, cardId: "card-1" },
        ...products,
      }),
      "/finance/institutions/inst-1/cards/card-1?sheet=card-reconciliation-sheet"
    )
  })

  it("returns null when the product is not loaded", () => {
    assert.equal(
      reconciliationProductHref({
        item: { kind: "card", accountId: null, cardId: "card-z" },
        ...products,
      }),
      null
    )
    assert.equal(
      reconciliationProductHref({
        item: { kind: "account", accountId: "acc-z", cardId: null },
        ...products,
      }),
      null
    )
  })
})
