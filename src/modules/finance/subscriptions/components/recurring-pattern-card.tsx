"use client"

import { MerchantCard } from "@/src/modules/finance/merchants/components/merchant-card"
import type { MerchantCardCategory } from "@/src/modules/finance/merchants/components/merchant-card"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceCategory,
  FinanceRecurringPattern,
} from "@/src/modules/finance/shared/types/entities"
import { recurringFrequencyLabel } from "@/src/modules/finance/subscriptions/lib/recurring-display"
import type { ReactNode } from "react"

type RecurringPatternCardProps = {
  pattern: FinanceRecurringPattern
  categories: readonly FinanceCategory[]
  display: FinanceMoneyDisplay
  /** Botones del footer; sin acciones queda solo el contexto de la detección. */
  actions?: ReactNode
}

function patternCategory(
  pattern: FinanceRecurringPattern,
  categories: readonly FinanceCategory[]
): MerchantCardCategory | null {
  const category = categories.find((item) => item.id === pattern.categoryId)
  if (!category) {
    return null
  }
  return { name: category.name, icon: category.icon, color: category.color }
}

/** Recurrente detectado con la card de comercio y su acción (#286). */
export function RecurringPatternCard({
  pattern,
  categories,
  display,
  actions,
}: RecurringPatternCardProps) {
  return (
    <MerchantCard
      merchant={{ name: pattern.merchantName, logoUrl: pattern.logoUrl }}
      category={patternCategory(pattern, categories)}
      display={display}
      variant="compact"
      footer={
        <span className="flex w-full items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {formatFinanceMoney(pattern.avgAmount, {
              ...display,
              currency: pattern.currency,
            })}{" "}
            · {recurringFrequencyLabel(pattern.frequency).toLowerCase()}
          </span>
          {actions ? (
            <span className="flex shrink-0 items-center gap-1">{actions}</span>
          ) : null}
        </span>
      }
    />
  )
}
