"use client"

import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { PlanningProgressVariant } from "@/src/modules/finance/shared/components/planning-progress-card"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  amountRatioPct,
  joinPlanningCaption,
} from "@/src/modules/finance/shared/lib/planning-lists"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"
import {
  remainingCaption,
  withCurrency,
} from "@/src/modules/finance/planning/lib/planning-captions"
import { PiggyBankIcon } from "lucide-react"

type GoalCardProps = {
  goal: FinanceSavingsGoal
  display: FinanceMoneyDisplay
  variant?: PlanningProgressVariant
  onPress?: () => void
}

/** Envoltorio sobre `PlanningProgressCard` hasta que #273 extraiga `GoalCard`. */
export function GoalCard({ goal, display, variant, onPress }: GoalCardProps) {
  const money = withCurrency(display, goal.currency)
  const current = parseFinanceMoney(goal.currentAmount)
  const target = parseFinanceMoney(goal.targetAmount)

  return (
    <PlanningProgressCard
      title={goal.name}
      description={goal.description ?? undefined}
      icon={PiggyBankIcon}
      tone={goal.isCompleted ? "success" : "info"}
      badge={{
        label: goal.isCompleted ? "Completada" : "En curso",
        variant: goal.isCompleted ? "success" : "info",
      }}
      progress={amountRatioPct(goal.currentAmount, goal.targetAmount)}
      currentHint="Ahorrado"
      currentLabel={formatFinanceMoney(goal.currentAmount, money)}
      targetHint="Meta"
      targetLabel={formatFinanceMoney(goal.targetAmount, money)}
      caption={joinPlanningCaption(
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
      )}
      onPress={onPress}
      variant={variant}
    />
  )
}
