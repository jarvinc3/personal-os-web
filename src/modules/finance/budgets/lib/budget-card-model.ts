import type {
  PlanningProgressBadge,
  PlanningProgressTone,
} from "@/src/modules/finance/shared/components/planning-progress-card"
import { budgetPctUsed } from "@/src/modules/finance/shared/lib/budget-payloads"
import { formatBudgetPeriodDate } from "@/src/modules/finance/shared/lib/budgets-query"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { joinPlanningCaption } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  type FinanceBudget,
} from "@/src/modules/finance/shared/types/entities"

export type BudgetCardModel = {
  title: string
  emoji?: string
  accentColor?: string | null
  tone: PlanningProgressTone
  badge: PlanningProgressBadge
  progress: number | null
  currentLabel: string
  targetLabel: string
  caption?: string
}

export function budgetCategoryLabel(budget: FinanceBudget): string {
  const list =
    budget.categories && budget.categories.length > 0
      ? budget.categories
      : budget.category
        ? [budget.category]
        : []
  if (list.length === 0) {
    return budget.name ?? "Categoría"
  }
  return list.map((category) => category.name).join(", ")
}

function budgetTone(
  pct: number | null,
  threshold: number
): PlanningProgressTone {
  if (pct === null) {
    return "info"
  }
  if (pct >= 100) {
    return "danger"
  }
  if (pct >= threshold) {
    return "warning"
  }
  return "info"
}

function badgeFor(tone: PlanningProgressTone): PlanningProgressBadge {
  if (tone === "danger") {
    return { label: "Excedido", variant: "danger" }
  }
  if (tone === "warning") {
    return { label: "Alerta", variant: "warning" }
  }
  return { label: "En curso", variant: "info" }
}

export function budgetCardModel(
  budget: FinanceBudget,
  display: FinanceMoneyDisplay
): BudgetCardModel {
  const pct = budgetPctUsed(budget.amountSpent, budget.amountLimit)
  const threshold = budget.alertThresholdPct ?? 80
  const tone = budgetTone(pct, threshold)
  const period =
    FINANCE_BUDGET_PERIOD_LABEL[budget.periodType] ?? budget.periodType
  const range = `${formatBudgetPeriodDate(budget.periodStart, display.locale)} – ${formatBudgetPeriodDate(budget.periodEnd, display.locale)}`
  const spent = parseFinanceMoney(budget.amountSpent)
  const limit = parseFinanceMoney(budget.amountLimit)
  const remaining = spent !== null && limit !== null ? limit - spent : null
  const remainingLabel =
    remaining === null
      ? undefined
      : remaining < 0
        ? `Excedido ${formatFinanceMoney(Math.abs(remaining), display)}`
        : `Quedan ${formatFinanceMoney(remaining, display)}`

  return {
    title: budgetCategoryLabel(budget),
    emoji: budget.category?.icon ?? undefined,
    accentColor: budget.category?.color,
    tone,
    badge: badgeFor(tone),
    progress: pct,
    currentLabel: formatFinanceMoney(budget.amountSpent, display),
    targetLabel: formatFinanceMoney(budget.amountLimit, display),
    caption: joinPlanningCaption(remainingLabel, period, range),
  }
}
