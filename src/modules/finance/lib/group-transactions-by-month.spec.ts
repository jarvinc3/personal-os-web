import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { FinanceTransaction } from "../types/entities.ts"
import { groupTransactionsByMonth } from "./group-transactions-by-month.ts"

function transaction(
  overrides: Partial<FinanceTransaction>
): FinanceTransaction {
  return {
    id: "tx-1",
    type: "DEBIT",
    status: "CONFIRMED",
    amount: "100",
    currency: "DOP",
    ledgerAmount: "-100",
    ledgerCurrency: "DOP",
    amountBaseCurrency: "100",
    transactionDate: "2026-09-01",
    transferGroupId: null,
    ...overrides,
  } as FinanceTransaction
}

describe("groupTransactionsByMonth", () => {
  it("orders months newest first and totals only income and expenses", () => {
    const groups = groupTransactionsByMonth([
      transaction({ id: "august", transactionDate: "2026-08-20" }),
      transaction({
        id: "september-income",
        type: "CREDIT",
        amount: "250",
        amountBaseCurrency: "250",
        transactionDate: "2026-09-10",
      }),
      transaction({
        id: "september-transfer",
        type: "TRANSFER",
        amount: "50",
        amountBaseCurrency: "50",
        transferGroupId: "group-1",
        transactionDate: "2026-09-11",
      }),
    ])

    assert.equal(groups.length, 2)
    assert.equal(groups[0]?.key, "2026-09")
    assert.equal(groups[0]?.items.length, 2)
    assert.equal(groups[0]?.income, 250)
    assert.equal(groups[0]?.expenses, 0)
    assert.equal(groups[1]?.key, "2026-08")
    assert.equal(groups[1]?.expenses, 100)
  })

  it("sorts movements inside a month newest first", () => {
    const groups = groupTransactionsByMonth([
      transaction({ id: "older", transactionDate: "2026-09-02" }),
      transaction({ id: "newer", transactionDate: "2026-09-25" }),
    ])

    assert.deepEqual(
      groups[0]?.items.map((item) => item.id),
      ["newer", "older"]
    )
  })
})
