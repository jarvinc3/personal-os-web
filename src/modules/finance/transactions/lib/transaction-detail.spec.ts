import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"

import {
  canConfirmTransaction,
  canUnlockConfirmedTransaction,
  transactionTypeLabel,
} from "./transaction-detail.ts"

function transaction(
  overrides: Partial<FinanceTransaction>
): FinanceTransaction {
  return {
    id: "tx-1",
    type: "DEBIT",
    status: "CONFIRMED",
    editable: "METADATA",
    amount: "10",
    currency: "DOP",
    ledgerAmount: "10",
    ledgerCurrency: "DOP",
    amountBaseCurrency: "10",
    exchangeRate: null,
    accountId: "acc-1",
    accountName: "Cuenta",
    cardId: null,
    cardName: null,
    categoryId: null,
    merchant: null,
    notes: null,
    source: "MANUAL",
    transactionDate: "2026-10-20T12:00:00.000Z",
    description: null,
    transferGroupId: null,
    transferToAccountId: null,
    transferToAccountName: null,
    transferToCardId: null,
    transferToCardName: null,
    ...overrides,
  }
}

describe("transactionTypeLabel", () => {
  it("translates known types and keeps unknown ones", () => {
    assert.equal(transactionTypeLabel("TRANSFER"), "Transferencia")
    assert.equal(transactionTypeLabel("SOMETHING"), "SOMETHING")
  })
})

describe("transaction detail actions", () => {
  it("only confirms a pending movement", () => {
    assert.equal(
      canConfirmTransaction(transaction({ status: "PENDING" })),
      true
    )
    assert.equal(
      canConfirmTransaction(transaction({ status: "CONFIRMED" })),
      false
    )
  })

  it("unlocks a confirmed movement but not a pending one", () => {
    assert.equal(
      canUnlockConfirmedTransaction(transaction({ status: "CONFIRMED" })),
      true
    )
    assert.equal(
      canUnlockConfirmedTransaction(
        transaction({ status: "PENDING", editable: "FULL" })
      ),
      false
    )
  })
})
