import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import {
  EMPTY_TRANSACTION_PREFILL,
  type TransactionPrefill,
} from "./transaction-prefill.ts"
import {
  destinationFromTransaction,
  movementTypeForTransaction,
  toFormValues,
} from "./transaction-form-values.ts"

const PREFILL: TransactionPrefill = {
  ...EMPTY_TRANSACTION_PREFILL,
  amount: "250.00",
  currency: "USD",
  categoryId: "cat-1",
  transactionDate: "2026-10-01T09:30",
  merchant: "Farmacia",
  description: "Compra",
}

describe("destinationFromTransaction", () => {
  it("targets the card before the account", () => {
    assert.equal(
      destinationFromTransaction({
        cardId: "card-1",
        accountId: "account-1",
      } as FinanceTransaction),
      "card:card-1"
    )
  })

  it("targets the account when the movement has no card", () => {
    assert.equal(
      destinationFromTransaction({
        accountId: "account-1",
      } as FinanceTransaction),
      "account:account-1"
    )
  })

  it("falls back to no target for a movement without account or card", () => {
    assert.equal(destinationFromTransaction(null), CATALOG_NONE)
  })
})

describe("movementTypeForTransaction", () => {
  it("keeps the requested type while creating", () => {
    assert.equal(movementTypeForTransaction(null, "DEBIT"), "DEBIT")
    assert.equal(movementTypeForTransaction(null, "CREDIT"), "CREDIT")
  })

  it("reads the type of an existing movement", () => {
    assert.equal(
      movementTypeForTransaction(
        { type: "CREDIT" } as FinanceTransaction,
        "DEBIT"
      ),
      "CREDIT"
    )
    assert.equal(
      movementTypeForTransaction(
        { type: "DEBIT" } as FinanceTransaction,
        "CREDIT"
      ),
      "DEBIT"
    )
  })

  it("treats a transfer movement as an expense", () => {
    assert.equal(
      movementTypeForTransaction(
        { type: "TRANSFER" } as FinanceTransaction,
        "CREDIT"
      ),
      "DEBIT"
    )
  })
})

describe("toFormValues", () => {
  it("fills the form from an existing movement", () => {
    const values = toFormValues({
      transaction: {
        type: "CREDIT",
        amount: "1000.00",
        currency: "DOP",
        transactionDate: "2026-10-02T14:05",
        accountId: "account-1",
        categoryId: "cat-2",
        status: "PENDING",
        merchant: "Banco",
        description: "Abono",
        notes: "Parcial",
      } as FinanceTransaction,
      initialType: "DEBIT",
      defaultCurrency: "USD",
      defaultDestination: "account:default",
      prefill: PREFILL,
    })

    assert.deepEqual(values, {
      type: "CREDIT",
      amount: "1000.00",
      currency: "DOP",
      transactionDate: "2026-10-02T14:05",
      destination: "account:account-1",
      categoryId: "cat-2",
      status: "PENDING",
      merchant: "Banco",
      description: "Abono",
      notes: "Parcial",
    })
  })

  it("fills the form from the prefill while creating", () => {
    const values = toFormValues({
      transaction: null,
      initialType: "DEBIT",
      defaultCurrency: "USD",
      defaultDestination: "account:default",
      prefill: PREFILL,
    })

    assert.deepEqual(values, {
      type: "DEBIT",
      amount: "250.00",
      currency: "USD",
      transactionDate: "2026-10-01T09:30",
      destination: "account:default",
      categoryId: "cat-1",
      status: "CONFIRMED",
      merchant: "Farmacia",
      description: "Compra",
      notes: "",
    })
  })

  it("falls back to the default currency and confirms a new movement", () => {
    const values = toFormValues({
      transaction: null,
      initialType: "DEBIT",
      defaultCurrency: "EUR",
      defaultDestination: "account:default",
      prefill: EMPTY_TRANSACTION_PREFILL,
    })

    assert.equal(values.currency, "EUR")
    assert.equal(values.categoryId, CATALOG_NONE)
    assert.equal(values.status, "CONFIRMED")
  })
})
