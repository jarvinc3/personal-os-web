import type {
  PlanningProgressBadge,
  PlanningProgressTone,
} from "@/src/modules/finance/shared/components/planning-progress-card"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  remainingCaption,
  withCurrency,
} from "@/src/modules/finance/shared/lib/planning-captions"
import {
  amountRatioPct,
  joinPlanningCaption,
} from "@/src/modules/finance/shared/lib/planning-lists"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"

export type GoalCardModel = {
  title: string
  description?: string
  tone: PlanningProgressTone
  badge: PlanningProgressBadge
  progress: number | null
  currentLabel: string
  targetLabel: string
  caption?: string
}

/** Textos, color y progreso de una meta de ahorro. */
export function goalCardModel(
  goal: FinanceSavingsGoal,
  display: FinanceMoneyDisplay
): GoalCardModel {
  const money = withCurrency(display, goal.currency)
  const current = parseFinanceMoney(goal.currentAmount)
  const target = parseFinanceMoney(goal.targetAmount)
  const completed = goal.isCompleted

  return {
    title: goal.name,
    description: goal.description ?? undefined,
    tone: completed ? "success" : "info",
    badge: {
      label: completed ? "Completada" : "En curso",
      variant: completed ? "success" : "info",
    },
    progress: amountRatioPct(goal.currentAmount, goal.targetAmount),
    currentLabel: formatFinanceMoney(goal.currentAmount, money),
    targetLabel: formatFinanceMoney(goal.targetAmount, money),
    caption: joinPlanningCaption(
      remainingCaption({
        current,
        target,
        display: money,
        reached: "Meta alcanzada",
        prefix: "Faltan",
      }),
      goal.targetDate
        ? `Para ${formatCalendarDate(goal.targetDate, display.locale)}`
        : undefined
    ),
  }
}
