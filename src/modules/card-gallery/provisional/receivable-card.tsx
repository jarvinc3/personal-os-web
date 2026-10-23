"use client"

import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import type { PlanningProgressVariant } from "@/src/modules/finance/shared/components/planning-progress-card"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  amountRatioPct,
  joinPlanningCaption,
} from "@/src/modules/finance/shared/lib/planning-lists"
import { remainingCaption } from "@/src/modules/finance/planning/lib/planning-captions"
import { receivableMoney } from "@/src/modules/finance/receivables/lib/receivable-totals"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  type FinanceReceivable,
} from "@/src/modules/finance/shared/types/entities"
import { HandshakeIcon } from "lucide-react"

type ReceivableCardProps = {
  receivable: FinanceReceivable
  display: FinanceMoneyDisplay
  variant?: PlanningProgressVariant
  selected?: boolean
  dimmed?: boolean
  onPress?: () => void
}

/**
 * PROVISIONAL (#272): temporary wrapper over `PlanningProgressCard` until
 * #273 extracts `ReceivableCard`. Delete with the gallery in #290.
 */
export function ReceivableCard({
  receivable,
  display,
  variant,
  selected = false,
  dimmed = false,
  onPress,
}: ReceivableCardProps) {
  const money = { ...display, currency: receivable.currency }
  const readable = receivableMoney(receivable)
  const caption = readable
    ? joinPlanningCaption(
        remainingCaption({
          current: readable.paid,
          target: readable.amount,
          display: money,
          reached: "Cobro completo",
          prefix: "Resta",
        }),
        receivable.dueDate
          ? `Vence ${formatCalendarDate(receivable.dueDate, display.locale)}`
          : undefined
      )
    : "Monto no disponible: el servidor envió un valor ilegible."
  const tone =
    receivable.status === "PAID"
      ? "success"
      : receivable.status === "PARTIAL"
        ? "info"
        : "warning"
  const badgeVariant =
    receivable.status === "PAID"
      ? "success"
      : receivable.status === "PARTIAL"
        ? "info"
        : "warning"

  return (
    <PlanningProgressCard
      title={receivable.debtorName}
      description={receivable.description ?? undefined}
      icon={HandshakeIcon}
      tone={tone}
      badge={{
        label:
          FINANCE_RECEIVABLE_STATUS_LABEL[receivable.status] ??
          receivable.status,
        variant: badgeVariant,
      }}
      progress={
        readable
          ? amountRatioPct(receivable.paidAmount, receivable.amount)
          : null
      }
      currentHint="Cobrado"
      currentLabel={formatFinanceMoney(receivable.paidAmount, money)}
      targetHint="Total"
      targetLabel={formatFinanceMoney(receivable.amount, money)}
      caption={caption}
      onPress={onPress}
      selection={selected || dimmed ? { selected, dimmed } : undefined}
      variant={variant}
    />
  )
}
