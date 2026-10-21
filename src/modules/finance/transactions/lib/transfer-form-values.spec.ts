import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { transferDefaults } from "./transfer-form-values.ts"

describe("transferDefaults", () => {
  it("starts an empty transfer in the default currency", () => {
    const values = transferDefaults(null, "USD")

    assert.equal(values.amount, "")
    assert.equal(values.currency, "USD")
    assert.match(values.transactionDate, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    assert.equal(values.fromTarget, CATALOG_NONE)
    assert.equal(values.toTarget, CATALOG_NONE)
    assert.equal(values.status, "CONFIRMED")
    assert.equal(values.rail, "")
    assert.equal(values.exchangeRate, "")
    assert.equal(values.receivedAmount, "")
  })

  it("reads the route and dates of an existing transfer", () => {
    const values = transferDefaults(
      {
        amount: "500.00",
        currency: "DOP",
        transactionDate: "2026-10-03T11:45",
        accountId: "account-1",
        transferToAccountId: "account-2",
        status: "PENDING",
        description: "Ahorro",
        notes: "Mensual",
      } as FinanceTransaction,
      "USD"
    )

    assert.equal(values.amount, "500.00")
    assert.equal(values.currency, "DOP")
    assert.equal(values.transactionDate, "2026-10-03T11:45")
    assert.equal(values.fromTarget, "account:account-1")
    assert.equal(values.toTarget, "account:account-2")
    assert.equal(values.status, "PENDING")
    assert.equal(values.description, "Ahorro")
    assert.equal(values.notes, "Mensual")
  })

  it("keeps the rate and received amount of a confirmed cross-currency transfer", () => {
    const values = transferDefaults(
      {
        accountId: "account-1",
        transferToCardId: "card-9",
        transferEstimated: false,
        exchangeRate: "0.0172",
        transferToAmount: "86.00",
      } as FinanceTransaction,
      "USD"
    )

    assert.equal(values.toTarget, "card:card-9")
    assert.equal(values.exchangeRate, "0.0172")
    assert.equal(values.receivedAmount, "86.00")
  })

  it("drops the rate while the transfer is still estimated", () => {
    const values = transferDefaults(
      {
        accountId: "account-1",
        transferEstimated: true,
        exchangeRate: "0.0172",
        transferToAmount: "86.00",
      } as FinanceTransaction,
      "USD"
    )

    assert.equal(values.exchangeRate, "")
    assert.equal(values.receivedAmount, "")
  })
})
