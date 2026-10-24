import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
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
import type {
  PlanningProgressBadge,
  PlanningProgressTone,
} from "@/src/modules/finance/shared/components/planning-progress-card"
import { receivableMoney } from "@/src/modules/finance/receivables/lib/receivable-totals"
import {
  publicShareItemCaption,
  publicShareItemProgress,
  type PublicReceivableShareItem,
} from "@/src/modules/finance/receivables/lib/public-receivable-share"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  FINANCE_RECEIVABLE_STATUS_VARIANT,
  type FinanceReceivable,
  type FinanceReceivableStatus,
} from "@/src/modules/finance/shared/types/entities"

export type ReceivableCardModel = {
  title: string
  description?: string
  tone: PlanningProgressTone
  badge: PlanningProgressBadge
  progress: number | null
  currentLabel: string
  targetLabel: string
  caption?: string
}

const UNREADABLE_AMOUNT =
  "Monto no disponible: el servidor envió un valor ilegible."

function receivableTone(status: FinanceReceivableStatus): PlanningProgressTone {
  if (status === "PAID") {
    return "success"
  }
  if (status === "PARTIAL") {
    return "info"
  }
  return "warning"
}

function receivableBadgeVariant(
  status: FinanceReceivableStatus
): PlanningProgressBadge["variant"] {
  if (status === "PAID") {
    return "success"
  }
  if (status === "PARTIAL") {
    return "info"
  }
  return "warning"
}

/** Cobro del dueño: textos, color y progreso desde la entidad. */
export function receivableCardModel(
  receivable: FinanceReceivable,
  display: FinanceMoneyDisplay
): ReceivableCardModel {
  const money = withCurrency(display, receivable.currency)
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
    : UNREADABLE_AMOUNT

  return {
    title: receivable.debtorName,
    description: receivable.description ?? undefined,
    tone: receivableTone(receivable.status),
    badge: {
      label:
        FINANCE_RECEIVABLE_STATUS_LABEL[receivable.status] ?? receivable.status,
      variant: receivableBadgeVariant(receivable.status),
    },
    progress: readable
      ? amountRatioPct(receivable.paidAmount, receivable.amount)
      : null,
    currentLabel: formatFinanceMoney(receivable.paidAmount, money),
    targetLabel: formatFinanceMoney(receivable.amount, money),
    caption,
  }
}

/** El mismo cobro visto desde un link público, sin sesión. */
export function sharedReceivableCardModel(
  item: PublicReceivableShareItem,
  display: FinanceMoneyDisplay
): ReceivableCardModel {
  const money = withCurrency(display, item.currency)

  return {
    title: item.concept,
    description: `Creado ${formatCalendarDate(item.createdAt, display.locale)}`,
    tone: item.status === "PAID" ? "success" : "info",
    badge: {
      label: FINANCE_RECEIVABLE_STATUS_LABEL[item.status] ?? item.status,
      variant: FINANCE_RECEIVABLE_STATUS_VARIANT[item.status],
    },
    progress: publicShareItemProgress(item),
    currentLabel: formatFinanceMoney(item.paid, money),
    targetLabel: formatFinanceMoney(item.amount, money),
    caption: publicShareItemCaption(item, display),
  }
}
