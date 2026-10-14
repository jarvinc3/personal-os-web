import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  parseISO,
  startOfDay,
} from "date-fns"

import type {
  FinanceRecurringPattern,
  FinanceSubscription,
  FinanceSubscriptionAlert,
  FinanceSubscriptionAlertKind,
  FinanceSubscriptionBreakdownAxis,
  FinanceSubscriptionBreakdownItem,
  FinanceSubscriptionGroupBy,
  FinanceSubscriptionUpcomingCharge,
} from "@/src/modules/finance/shared/types/entities"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { brandInitials } from "@/src/modules/finance/shared/components/brand-initials"
import type { RingStackSlice } from "@/src/modules/finance/shared/lib/ring-stack"

export const SUBSCRIPTION_BREAKDOWN_LABEL: Record<
  FinanceSubscriptionBreakdownAxis,
  string
> = {
  category: "Categoría",
  instrument: "Tarjeta o cuenta",
  currency: "Moneda",
}

export const SUBSCRIPTION_ALERT_LABEL: Record<
  FinanceSubscriptionAlertKind,
  string
> = {
  PRICE_INCREASE: "Subida de precio",
  TRIAL_ENDING: "Prueba por vencer",
  ANNUAL_RENEWAL: "Renovación anual",
  MISSED_CHARGE: "Cobro sin registrar",
}

const UNCATEGORIZED_GROUP_LABEL = "Sin categoría"
const NO_METHOD_GROUP_LABEL = "Sin método"

export type SubscriptionCycleProgress = {
  startDate: Date
  endDate: Date
  /** Whole days elapsed in the current cycle. */
  elapsedDays: number
  cycleDays: number
  /** 0–100, clamped. */
  percent: number
}

function cycleStart(subscription: FinanceSubscription): Date {
  const next = startOfDay(parseISO(subscription.nextBillingDate))
  const interval = subscription.billingInterval
  switch (subscription.billingCycle) {
    case "WEEKLY":
      return addDays(next, -7 * interval)
    case "MONTHLY":
      return addMonths(next, -interval)
    case "QUARTERLY":
      return addMonths(next, -3 * interval)
    case "SEMIANNUAL":
      return addMonths(next, -6 * interval)
    case "YEARLY":
      return addMonths(next, -12 * interval)
  }
}

/**
 * How far the current billing cycle has run, from the charge before the next
 * one to the next one. The anchor is not used so a month-end cycle still
 * measures the real days of that month.
 */
export function subscriptionCycleProgress(
  subscription: FinanceSubscription,
  now: Date
): SubscriptionCycleProgress {
  const endDate = startOfDay(parseISO(subscription.nextBillingDate))
  const startDate = cycleStart(subscription)
  const cycleDays = Math.max(1, differenceInCalendarDays(endDate, startDate))
  const elapsedDays = differenceInCalendarDays(startOfDay(now), startDate)
  const ratio = elapsedDays / cycleDays
  return {
    startDate,
    endDate,
    elapsedDays,
    cycleDays,
    percent: Math.min(100, Math.max(0, ratio * 100)),
  }
}

export type SubscriptionGroup = {
  key: string
  label: string
  items: FinanceSubscription[]
}

function groupKeyFor(
  subscription: FinanceSubscription,
  groupBy: FinanceSubscriptionGroupBy
): { key: string; label: string } {
  if (groupBy === "category") {
    if (!subscription.category) {
      return { key: "uncategorized", label: UNCATEGORIZED_GROUP_LABEL }
    }
    return { key: subscription.category.id, label: subscription.category.name }
  }
  if (groupBy === "provider") {
    if (!subscription.paymentMethod) {
      return { key: "no-method", label: NO_METHOD_GROUP_LABEL }
    }
    return {
      key: subscription.paymentMethod.id,
      label: subscription.paymentMethod.name,
    }
  }
  return { key: "all", label: "Todas" }
}

/** Groups the card list per the user's `subscriptions.groupBy` setting. */
export function groupSubscriptions(
  items: FinanceSubscription[],
  groupBy: FinanceSubscriptionGroupBy
): SubscriptionGroup[] {
  const groups = new Map<string, SubscriptionGroup>()
  for (const item of items) {
    const descriptor = groupKeyFor(item, groupBy)
    const existing = groups.get(descriptor.key)
    if (existing) {
      existing.items.push(item)
      continue
    }
    groups.set(descriptor.key, {
      key: descriptor.key,
      label: descriptor.label,
      items: [item],
    })
  }
  return [...groups.values()]
}

/** Charges of each day, keyed by `YYYY-MM-DD`, for the monthly calendar. */
export function upcomingByDay(
  items: FinanceSubscriptionUpcomingCharge[]
): Map<string, FinanceSubscriptionUpcomingCharge[]> {
  const byDay = new Map<string, FinanceSubscriptionUpcomingCharge[]>()
  for (const item of items) {
    const day = byDay.get(item.date)
    if (day) {
      day.push(item)
      continue
    }
    byDay.set(item.date, [item])
  }
  return byDay
}

export function alertOccurrenceLabel(alert: FinanceSubscriptionAlert): string {
  if (alert.kind === "MISSED_CHARGE") {
    return `Esperado el ${alert.date}`
  }
  if (alert.daysUntil === null) {
    return alert.date
  }
  if (alert.daysUntil <= 0) {
    return "Hoy"
  }
  return `En ${alert.daysUntil} día${alert.daysUntil === 1 ? "" : "s"}`
}

export type SubscriptionListFilter = {
  categoryId?: string
  cardId?: string
  accountId?: string
  currency?: string
}

/** Filter the card list should apply when a breakdown slice is selected. */
export function breakdownFilter(
  by: FinanceSubscriptionBreakdownAxis,
  key: string
): SubscriptionListFilter | null {
  if (by === "currency") {
    return { currency: key }
  }
  if (by === "category") {
    if (key === "uncategorized") {
      return null
    }
    return { categoryId: key }
  }
  if (key.startsWith("CARD:")) {
    return { cardId: key.slice("CARD:".length) }
  }
  if (key.startsWith("ACCOUNT:")) {
    return { accountId: key.slice("ACCOUNT:".length) }
  }
  return null
}

const SUBSCRIPTION_SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

/** Maps the breakdown groups to the shared ring/legend slice shape. */
export function buildSubscriptionSlices(
  items: FinanceSubscriptionBreakdownItem[],
  display: FinanceMoneyDisplay
): RingStackSlice[] {
  const total = items.reduce(
    (sum, item) => sum + (parseFinanceMoney(item.amount) ?? 0),
    0
  )
  return items.map((item, index) => {
    const amount = parseFinanceMoney(item.amount) ?? 0
    const percent = total > 0 ? (amount / total) * 100 : 0
    return {
      key: item.key,
      kind: "institution",
      name: item.label,
      monogram: brandInitials(item.label),
      logoUrl: null,
      color:
        item.color ??
        SUBSCRIPTION_SLICE_COLORS[index % SUBSCRIPTION_SLICE_COLORS.length]!,
      signedValue: amount,
      amountLabel: formatFinanceMoney(amount, display),
      assetsValue: amount,
      debtValue: 0,
      debtLabel: null,
      value: amount,
      percent,
      percentLabel:
        percent > 0 && Math.round(percent) === 0
          ? "<1%"
          : `${Math.round(percent)}%`,
    }
  })
}

/** Create payload that turns a detected recurring charge into a subscription. */
export function subscriptionPayloadFromPattern(
  pattern: FinanceRecurringPattern
): Record<string, unknown> {
  const schedule =
    pattern.frequency === 365
      ? { billingCycle: "YEARLY", billingInterval: 1 }
      : pattern.frequency === 7
        ? { billingCycle: "WEEKLY", billingInterval: 1 }
        : pattern.frequency === 14
          ? { billingCycle: "WEEKLY", billingInterval: 2 }
          : { billingCycle: "MONTHLY", billingInterval: 1 }
  return {
    name: pattern.merchantName,
    amount: Number(pattern.avgAmount),
    currency: pattern.currency,
    anchorDate: pattern.nextExpectedDate,
    sourcePatternId: pattern.id,
    ...schedule,
  }
}
