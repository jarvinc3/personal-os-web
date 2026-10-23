"use client"

import {
  receivableCardModel,
  sharedReceivableCardModel,
} from "@/src/modules/finance/receivables/lib/receivable-card-model"
import type { PublicReceivableShareItem } from "@/src/modules/finance/receivables/lib/public-receivable-share"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { PlanningProgressVariant } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import { HandshakeIcon } from "lucide-react"

export type ReceivableCardSource =
  | { kind: "receivable"; receivable: FinanceReceivable }
  | { kind: "shared"; item: PublicReceivableShareItem }

type ReceivableCardProps = {
  source: ReceivableCardSource
  display: FinanceMoneyDisplay
  variant?: PlanningProgressVariant
  href?: string
  onPress?: () => void
  /** Present only while the list is picking cobros; adds the round check. */
  selection?: { selected: boolean; dimmed?: boolean }
  onLongPress?: () => void
}

export function ReceivableCard({
  source,
  display,
  variant,
  href,
  onPress,
  selection,
  onLongPress,
}: ReceivableCardProps) {
  const model =
    source.kind === "receivable"
      ? receivableCardModel(source.receivable, display)
      : sharedReceivableCardModel(source.item, display)

  return (
    <PlanningProgressCard
      title={model.title}
      description={model.description}
      icon={HandshakeIcon}
      tone={model.tone}
      badge={model.badge}
      progress={model.progress}
      currentHint="Cobrado"
      currentLabel={model.currentLabel}
      targetHint="Total"
      targetLabel={model.targetLabel}
      caption={model.caption}
      href={href}
      onPress={onPress}
      selection={selection}
      onLongPress={onLongPress}
      variant={variant}
    />
  )
}
