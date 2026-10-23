"use client"

import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { PlanningProgressVariant } from "@/src/modules/finance/shared/components/planning-progress-card"
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
import { ChartPieIcon } from "lucide-react"

function categoryLabel(budget: FinanceBudget): string {
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

function budgetTone(pct: number | null, threshold: number) {
  if (pct === null) {
    return "info" as const
  }
  if (pct >= 100) {
    return "danger" as const
  }
  if (pct >= threshold) {
    return "warning" as const
  }
  return "info" as const
}

type BudgetCardProps = {
  budget: FinanceBudget
  display: FinanceMoneyDisplay
  variant?: PlanningProgressVariant
  onPress?: () => void
}

/**
 * PROVISIONAL (#272): temporary wrapper over `PlanningProgressCard` until
 * #273 extracts `BudgetCard`. Delete with the gallery in #290.
 */
export function BudgetCard({
  budget,
  display,
  variant,
  onPress,
}: BudgetCardProps) {
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
  const emoji = budget.category?.icon

  return (
    <PlanningProgressCard
      title={categoryLabel(budget)}
      leading={
        emoji ? (
          <span className="text-lg leading-none">{emoji}</span>
        ) : undefined
      }
      icon={emoji ? undefined : ChartPieIcon}
      tone={tone}
      accentColor={budget.category?.color}
      badge={{
        label:
          tone === "danger"
            ? "Excedido"
            : tone === "warning"
              ? "Alerta"
              : "En curso",
        variant:
          tone === "danger"
            ? "danger"
            : tone === "warning"
              ? "warning"
              : "info",
      }}
      progress={pct}
      currentHint="Gastado"
      currentLabel={formatFinanceMoney(budget.amountSpent, display)}
      targetHint="Tope"
      targetLabel={formatFinanceMoney(budget.amountLimit, display)}
      caption={joinPlanningCaption(remainingLabel, period, range)}
      onPress={onPress}
      variant={variant}
    />
  )
}
