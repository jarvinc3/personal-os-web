import {
  roundDecimal,
  toDecimal,
} from "@/src/modules/finance/shared/lib/decimal"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceBudgetStatus } from "@/src/modules/finance/shared/types/entities"

export type BudgetOverage = {
  budget: FinanceBudgetStatus
  /** Spent after this expense minus the limit, already rounded. */
  excess: string
}

/** The newest budget that covers the category on the movement date. */
function activeBudget({
  budgets,
  categoryId,
  date,
}: {
  budgets: readonly FinanceBudgetStatus[]
  categoryId: string
  date: string
}): FinanceBudgetStatus | null {
  const matching = budgets.filter(
    (budget) =>
      budget.categoryId === categoryId &&
      budget.periodStart.slice(0, 10) <= date &&
      date <= budget.periodEnd.slice(0, 10)
  )
  if (matching.length === 0) {
    return null
  }
  return matching.reduce((newest, budget) =>
    budget.periodStart > newest.periodStart ? budget : newest
  )
}

/**
 * Overage of a new expense against the active budget of its category, or null
 * when the expense fits, the category has no budget, or the amounts are not
 * readable.
 */
export function budgetOverageForExpense({
  budgets,
  categoryId,
  date,
  amount,
}: {
  budgets: readonly FinanceBudgetStatus[]
  categoryId: string
  date: string
  amount: string
}): BudgetOverage | null {
  if (!categoryId) {
    return null
  }
  const expense = parseFinanceMoney(amount)
  if (expense === null || expense <= 0) {
    return null
  }
  const budget = activeBudget({
    budgets,
    categoryId,
    date: date.slice(0, 10),
  })
  if (!budget) {
    return null
  }
  const limit = parseFinanceMoney(budget.amountLimit)
  const spent = parseFinanceMoney(budget.amountSpent)
  if (limit === null || spent === null) {
    return null
  }
  const remaining = toDecimal(limit).minus(toDecimal(spent))
  if (toDecimal(expense).lessThanOrEqualTo(remaining)) {
    return null
  }
  const excess = roundDecimal(
    toDecimal(spent).plus(toDecimal(expense)).minus(toDecimal(limit))
  )
  return { budget, excess: excess.toFixed(2) }
}
