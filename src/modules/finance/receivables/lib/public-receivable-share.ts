import { format, isSameDay, parseISO, subDays } from "date-fns"
import { es } from "date-fns/locale/es"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { amountRatioPct } from "@/src/modules/finance/shared/lib/planning-lists"
import type { FinanceReceivableStatus } from "@/src/modules/finance/shared/types/entities"
import type { ShareCurrencyPending } from "@/src/modules/finance/receivables/lib/receivable-share"

/** `GET /public/receivable-shares/:token`, read-only and without a session. */
export type PublicReceivableShare = {
  ownerFirstName: string
  debtorName: string
  updatedAt: string
  totalsByCurrency: PublicReceivableShareCurrencyTotal[]
  items: PublicReceivableShareItem[]
}

export type PublicReceivableShareCurrencyTotal = {
  currency: string
  amount: string
  paid: string
  pending: string
}

export type PublicReceivableShareItem = {
  ref: string
  concept: string
  createdAt: string
  dueDate: string | null
  amount: string
  paid: string
  pending: string
  currency: string
  status: FinanceReceivableStatus
  note: string | null
  payments: { paidAt: string; amount: string }[]
}

export type PublicShareCurrencyRow = {
  currency: string
  pendingLabel: string
  paidCaption: string
  totalCaption: string
  progress: number
}

export type PublicShareSummaryRow = {
  label: string
  value: string
  /** Collected money stands out in green on the read-only page. */
  tone?: "success"
}

export type PublicSharePaymentRow = {
  key: string
  amountLabel: string
  dateLabel: string
}

/**
 * One row per currency: the public page never converts, so each currency keeps
 * its own pending amount, bar and captions.
 */
export function publicShareCurrencyRows(
  totals: readonly PublicReceivableShareCurrencyTotal[],
  display: FinanceMoneyDisplay
): PublicShareCurrencyRow[] {
  return totals.map((total) => {
    const money = { ...display, currency: total.currency }
    const progress = amountRatioPct(total.paid, total.amount) ?? 0
    return {
      currency: total.currency,
      pendingLabel: formatFinanceMoney(total.pending, money),
      paidCaption: `${formatFinanceMoney(total.paid, money)} pagado · ${Math.round(progress)}%`,
      totalCaption: `Total ${formatFinanceMoney(total.amount, money)}`,
      progress,
    }
  })
}

/** The same rows as the share sheet: pending per currency, ready to join. */
export function publicSharePendingTotals(
  totals: readonly PublicReceivableShareCurrencyTotal[],
  display: FinanceMoneyDisplay
): ShareCurrencyPending[] {
  return totals.map((total) => ({
    currency: total.currency,
    pending: parseFinanceMoney(total.pending) ?? 0,
    label: formatFinanceMoney(total.pending, {
      ...display,
      currency: total.currency,
    }),
  }))
}

export function publicShareItemProgress(
  item: PublicReceivableShareItem
): number {
  return Math.min(100, Math.max(0, amountRatioPct(item.paid, item.amount) ?? 0))
}

/** `Resta … · Vence …` under a shared card, or `Cobro completo`. */
export function publicShareItemCaption(
  item: PublicReceivableShareItem,
  display: FinanceMoneyDisplay
): string {
  const money = { ...display, currency: item.currency }
  const pending = parseFinanceMoney(item.pending) ?? 0
  const remaining =
    pending > 0
      ? `Resta ${formatFinanceMoney(item.pending, money)}`
      : "Cobro completo"
  return item.dueDate
    ? `${remaining} · Vence ${formatCalendarDate(item.dueDate)}`
    : remaining
}

export function publicShareSummaryRows(
  item: PublicReceivableShareItem,
  display: FinanceMoneyDisplay
): PublicShareSummaryRow[] {
  const money = { ...display, currency: item.currency }
  const rows: PublicShareSummaryRow[] = [
    { label: "Monto total", value: formatFinanceMoney(item.amount, money) },
    {
      label: "Pagado",
      value: formatFinanceMoney(item.paid, money),
      tone: "success",
    },
    { label: "Pendiente", value: formatFinanceMoney(item.pending, money) },
    { label: "Creado", value: formatCalendarDate(item.createdAt) },
  ]
  if (item.dueDate) {
    rows.push({ label: "Vence", value: formatCalendarDate(item.dueDate) })
  }
  return rows
}

export function publicSharePaymentRows(
  item: PublicReceivableShareItem,
  display: FinanceMoneyDisplay
): PublicSharePaymentRow[] {
  const money = { ...display, currency: item.currency }
  return item.payments.map((payment) => ({
    key: `${payment.paidAt}-${payment.amount}`,
    amountLabel: formatFinanceMoney(payment.amount, money),
    dateLabel: formatCalendarDate(payment.paidAt),
  }))
}

export function publicShareDetailDescription(ownerFirstName: string): string {
  return `Cobro compartido por ${ownerFirstName} · solo lectura`
}

/** `Actualizado hoy, 7:30 p. m.`, `Actualizado ayer, …` or `Actualizado el 12 sep`. */
export function formatPublicShareUpdatedAt(iso: string, now: Date): string {
  const date = parseISO(iso)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  if (isSameDay(date, now)) {
    return `Actualizado hoy, ${format(date, "hh:mm aaaa", { locale: es })}`
  }
  if (isSameDay(date, subDays(now, 1))) {
    return `Actualizado ayer, ${format(date, "hh:mm aaaa", { locale: es })}`
  }
  return `Actualizado el ${format(date, "d MMM", { locale: es })}`
}

export function publicShareCountCaption(count: number): string {
  return count === 1 ? "1 cobro" : `${count} cobros`
}
