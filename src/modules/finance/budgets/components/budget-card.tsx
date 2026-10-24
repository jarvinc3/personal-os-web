"use client"

import { budgetCardModel } from "@/src/modules/finance/budgets/lib/budget-card-model"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { PlanningProgressVariant } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceBudget } from "@/src/modules/finance/shared/types/entities"
import { ChartPieIcon } from "lucide-react"

type BudgetCardProps = {
  budget: FinanceBudget
  display: FinanceMoneyDisplay
  variant?: PlanningProgressVariant
  href?: string
  onPress?: () => void
  selected?: boolean
  disabled?: boolean
}

export function BudgetCard({
  budget,
  display,
  variant,
  href,
  onPress,
  selected = false,
  disabled = false,
}: BudgetCardProps) {
  const model = budgetCardModel(budget, display)

  return (
    <PlanningProgressCard
      title={model.title}
      leading={
        model.emoji ? (
          <span className="text-lg leading-none">{model.emoji}</span>
        ) : undefined
      }
      icon={model.emoji ? undefined : ChartPieIcon}
      tone={model.tone}
      accentColor={model.accentColor}
      badge={model.badge}
      progress={model.progress}
      currentHint="Gastado"
      currentLabel={model.currentLabel}
      targetHint="Tope"
      targetLabel={model.targetLabel}
      caption={model.caption}
      href={href}
      onPress={onPress}
      selected={selected}
      disabled={disabled}
      variant={variant}
    />
  )
}
