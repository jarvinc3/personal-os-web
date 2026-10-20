import { sumDecimals } from "@/src/modules/finance/shared/lib/decimal"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  receivablePending,
  visibleReceivables,
} from "@/src/modules/finance/shared/lib/planning-lists"
import type {
  FinanceBudgetStatus,
  FinanceLoan,
  FinanceReceivable,
  FinanceSavingsGoal,
} from "@/src/modules/finance/shared/types/entities"
import type { PlanningTab } from "@/src/modules/finance/planning/lib/planning-tabs"

/** Everything the planning hero needs to total the tabs. */
export type PlanningTotalsInput = {
  savings: readonly FinanceSavingsGoal[]
  budgets: readonly FinanceBudgetStatus[]
  receivables: readonly FinanceReceivable[]
  loans: readonly FinanceLoan[]
}

type MoneyEntry = {
  currency: string
  amount: number | null
}

type CurrencyTotal = {
  currency: string
  amount: string
}

function sumByCurrency(entries: readonly MoneyEntry[]): CurrencyTotal[] {
  const amountsByCurrency = new Map<string, number[]>()
  for (const entry of entries) {
    const currency = entry.currency.trim().toUpperCase()
    if (entry.amount === null || !currency) {
      continue
    }
    const amounts = amountsByCurrency.get(currency) ?? []
    amountsByCurrency.set(currency, [...amounts, entry.amount])
  }
  return [...amountsByCurrency.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amounts]) => ({
      currency,
      amount: sumDecimals(amounts).toFixed(2),
    }))
}

function planningTabEntries(
  tab: PlanningTab,
  input: PlanningTotalsInput,
  baseCurrency: string
): MoneyEntry[] {
  if (tab === "savings") {
    return input.savings.map((goal) => ({
      currency: goal.currency,
      amount: parseFinanceMoney(goal.currentAmount),
    }))
  }
  if (tab === "budgets") {
    return input.budgets.map((budget) => ({
      currency: baseCurrency,
      amount: parseFinanceMoney(budget.amountSpent),
    }))
  }
  if (tab === "receivables") {
    return visibleReceivables([...input.receivables]).map((receivable) => ({
      currency: receivable.currency,
      amount: receivablePending(receivable),
    }))
  }
  return input.loans.map((loan) => ({
    currency: loan.currency,
    amount: parseFinanceMoney(loan.currentBalance),
  }))
}

/**
 * Total for one planning tab. Money is never converted between currencies, so a
 * tab that mixes them shows one figure per currency joined by `+`.
 */
export function formatPlanningTabTotal({
  tab,
  input,
  display,
}: {
  tab: PlanningTab
  input: PlanningTotalsInput
  display: FinanceMoneyDisplay
}): string {
  const totals = sumByCurrency(planningTabEntries(tab, input, display.currency))
  if (totals.length === 0) {
    return formatFinanceMoney("0", display)
  }
  return totals
    .map((total) =>
      formatFinanceMoney(total.amount, {
        ...display,
        currency: total.currency,
      })
    )
    .join(" + ")
}
