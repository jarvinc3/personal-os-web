"use client"

import { goalCardModel } from "@/src/modules/finance/savings-goals/lib/goal-card-model"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { PlanningProgressVariant } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"
import { PiggyBankIcon } from "lucide-react"

type GoalCardProps = {
  goal: FinanceSavingsGoal
  display: FinanceMoneyDisplay
  variant?: PlanningProgressVariant
  href?: string
  onPress?: () => void
}

export function GoalCard({
  goal,
  display,
  variant,
  href,
  onPress,
}: GoalCardProps) {
  const model = goalCardModel(goal, display)

  return (
    <PlanningProgressCard
      title={model.title}
      description={model.description}
      icon={PiggyBankIcon}
      tone={model.tone}
      badge={model.badge}
      progress={model.progress}
      currentHint="Ahorrado"
      currentLabel={model.currentLabel}
      targetHint="Meta"
      targetLabel={model.targetLabel}
      caption={model.caption}
      href={href}
      onPress={onPress}
      variant={variant}
    />
  )
}
