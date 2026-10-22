import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { assessExpenseBalance } from "./expense-balance.ts"

const BANK = {
  accountType: "CHECKING" as const,
  balance: "12500",
  amount: "50000",
  accountCurrency: "DOP",
  transactionCurrency: "DOP",
}

const CASH = { ...BANK, accountType: "CASH" as const }

describe("assessExpenseBalance", () => {
  it("accepts an expense that leaves a positive balance", () => {
    assert.deepEqual(assessExpenseBalance({ ...BANK, amount: "1000" }), {
      status: "ok",
    })
  })

  it("accepts an expense that leaves exactly zero", () => {
    assert.deepEqual(assessExpenseBalance({ ...BANK, amount: "12500" }), {
      status: "ok",
    })
  })

  it("asks for confirmation when a bank account would go negative", () => {
    assert.deepEqual(assessExpenseBalance(BANK), {
      status: "confirm",
      projectedBalance: -37500,
    })
  })

  it("blocks a cash account that would go negative", () => {
    assert.deepEqual(assessExpenseBalance(CASH), {
      status: "blocked",
      projectedBalance: -37500,
    })
  })

  it("does not compare amounts in different currencies", () => {
    assert.deepEqual(
      assessExpenseBalance({ ...CASH, transactionCurrency: "USD" }),
      { status: "ok" }
    )
  })

  it("leaves the check to the API when a value is not readable", () => {
    assert.deepEqual(assessExpenseBalance({ ...CASH, amount: "—" }), {
      status: "ok",
    })
  })
})
