import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceBudgetStatus } from "@/src/modules/finance/shared/types/entities"

import { budgetOverageForExpense } from "./budget-overage.ts"

function budget(
  overrides: Partial<FinanceBudgetStatus> = {}
): FinanceBudgetStatus {
  return {
    id: "budget-1",
    categoryId: "cat-food",
    category: "Comida",
    color: null,
    icon: null,
    periodType: "MONTHLY",
    periodStart: "2026-10-01",
    periodEnd: "2026-10-31",
    amountLimit: "5000.00",
    amountSpent: "5200.00",
    pctUsed: 104,
    threshold: 80,
    ...overrides,
  }
}

const input = {
  budgets: [budget()],
  categoryId: "cat-food",
  date: "2026-10-15",
  amount: "100",
}

describe("budgetOverageForExpense", () => {
  it("reports the excess that remains after the new expense", () => {
    const overage = budgetOverageForExpense(input)

    assert.equal(overage?.budget.id, "budget-1")
    assert.equal(overage?.excess, "300.00")
  })

  it("returns null when the expense fits in the remaining amount", () => {
    const overage = budgetOverageForExpense({
      ...input,
      budgets: [budget({ amountSpent: "4000.00" })],
      amount: "1000",
    })

    assert.equal(overage, null)
  })

  it("reports a one-cent excess", () => {
    const overage = budgetOverageForExpense({
      ...input,
      budgets: [budget({ amountSpent: "4000.00" })],
      amount: "1000.01",
    })

    assert.equal(overage?.excess, "0.01")
  })

  it("ignores another category and a date outside the period", () => {
    assert.equal(
      budgetOverageForExpense({ ...input, categoryId: "cat-travel" }),
      null
    )
    assert.equal(
      budgetOverageForExpense({ ...input, date: "2026-11-01" }),
      null
    )
  })

  it("uses the newest budget when two cover the same date", () => {
    const overage = budgetOverageForExpense({
      ...input,
      budgets: [
        budget({ id: "old", periodStart: "2026-10-01" }),
        budget({
          id: "new",
          periodStart: "2026-10-10",
          amountSpent: "4950.00",
        }),
      ],
    })

    assert.equal(overage?.budget.id, "new")
    assert.equal(overage?.excess, "50.00")
  })

  it("returns null with unreadable amounts instead of inventing a budget", () => {
    assert.equal(
      budgetOverageForExpense({
        ...input,
        budgets: [budget({ amountLimit: "" })],
      }),
      null
    )
    assert.equal(budgetOverageForExpense({ ...input, amount: "" }), null)
  })
})
