import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceBudgetStatus,
  FinanceLoan,
  FinanceReceivable,
  FinanceSavingsGoal,
} from "@/src/modules/finance/shared/types/entities"

import {
  formatPlanningTabTotal,
  type PlanningTotalsInput,
} from "./planning-totals.ts"

const DISPLAY: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
}

function savingsGoal(
  overrides: Partial<FinanceSavingsGoal>
): FinanceSavingsGoal {
  return {
    id: "goal-1",
    name: "Viaje",
    description: null,
    targetAmount: "1000",
    currentAmount: "0",
    currency: "DOP",
    targetDate: null,
    accountId: null,
    mode: "EARMARK",
    spendReducesProgress: false,
    isCompleted: false,
    completedAt: null,
    ...overrides,
  }
}

function budgetStatus(
  overrides: Partial<FinanceBudgetStatus>
): FinanceBudgetStatus {
  return {
    id: "budget-1",
    categoryId: "category-1",
    category: "Comida",
    color: null,
    icon: null,
    periodType: "MONTHLY",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    amountLimit: "1000",
    amountSpent: "0",
    pctUsed: 0,
    threshold: 80,
    ...overrides,
  }
}

function receivable(overrides: Partial<FinanceReceivable>): FinanceReceivable {
  return {
    id: "receivable-1",
    debtorName: "Ana",
    description: null,
    amount: "0",
    paidAmount: "0",
    creditBalance: "0",
    writtenOffAmount: "0",
    writtenOffAt: null,
    currency: "DOP",
    dueDate: null,
    status: "PENDING",
    ...overrides,
  }
}

function loan(overrides: Partial<FinanceLoan>): FinanceLoan {
  return {
    id: "loan-1",
    institutionId: null,
    accountId: null,
    lenderName: "Banco",
    originalAmount: "1000",
    currentBalance: "0",
    currency: "DOP",
    installmentAmount: "100",
    installmentFreq: "MONTHLY",
    totalInstallments: 10,
    paidInstallments: 0,
    nextDueDate: "2026-02-01",
    interestRate: null,
    rateType: "FIXED",
    insuranceAmount: null,
    prepaymentPenaltyPct: null,
    notes: null,
    isActive: true,
    ...overrides,
  }
}

function totalsInput(
  overrides: Partial<PlanningTotalsInput>
): PlanningTotalsInput {
  return { savings: [], budgets: [], receivables: [], loans: [], ...overrides }
}

describe("formatPlanningTabTotal", () => {
  it("sums the saved amount of the savings tab, one figure per currency", () => {
    const total = formatPlanningTabTotal({
      tab: "savings",
      input: totalsInput({
        savings: [
          savingsGoal({ id: "a", currentAmount: "1000" }),
          savingsGoal({ id: "b", currentAmount: "500" }),
          savingsGoal({ id: "c", currentAmount: "200", currency: "USD" }),
        ],
      }),
      display: DISPLAY,
    })

    assert.equal(total, "DOP $1,500.00 + USD $200.00")
  })

  it("sums the spent amount of the budgets tab in the base currency", () => {
    const total = formatPlanningTabTotal({
      tab: "budgets",
      input: totalsInput({
        budgets: [
          budgetStatus({ id: "a", amountSpent: "100.50" }),
          budgetStatus({ id: "b", amountSpent: "250" }),
        ],
      }),
      display: DISPLAY,
    })

    assert.equal(total, "DOP $350.50")
  })

  it("sums what is still pending on cobros and skips cancelled ones", () => {
    const total = formatPlanningTabTotal({
      tab: "receivables",
      input: totalsInput({
        receivables: [
          receivable({ id: "a", amount: "300", paidAmount: "100" }),
          receivable({ id: "b", amount: "50", status: "CANCELLED" }),
        ],
      }),
      display: DISPLAY,
    })

    assert.equal(total, "DOP $200.00")
  })

  it("sums the outstanding balance of the loans tab", () => {
    const total = formatPlanningTabTotal({
      tab: "loans",
      input: totalsInput({
        loans: [
          loan({ id: "a", currentBalance: "1200.25" }),
          loan({ id: "b", currentBalance: "99.75" }),
        ],
      }),
      display: DISPLAY,
    })

    assert.equal(total, "DOP $1,300.00")
  })

  it("shows zero in the base currency for an empty tab", () => {
    const total = formatPlanningTabTotal({
      tab: "savings",
      input: totalsInput({}),
      display: DISPLAY,
    })

    assert.equal(total, "DOP $0.00")
  })
})
