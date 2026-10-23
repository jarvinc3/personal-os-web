import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns"

import {
  financeMoneyDifference,
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceBillingCycle,
  FinanceSubscription,
  FinanceSubscriptionAlert,
  FinanceSubscriptionAlertKind,
  FinanceSubscriptionStatus,
  FinanceSubscriptionSummary,
} from "@/src/modules/finance/shared/types/entities"
import {
  billingLabel,
  shortBillingDate,
  subscriptionIsOverdue,
} from "./subscription-timing.ts"

export const BILLING_CYCLE_LABEL: Record<FinanceBillingCycle, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  YEARLY: "Anual",
}

export const SUBSCRIPTION_STATUS_LABEL: Record<
  FinanceSubscriptionStatus,
  string
> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
}

export type SubscriptionBadgeVariant =
  "success" | "warning" | "secondary" | "danger"

export function billingCycleLabel(
  cycle: FinanceBillingCycle,
  interval: number
): string {
  const base = BILLING_CYCLE_LABEL[cycle] ?? cycle
  return interval > 1 ? `${base} cada ${interval}` : base
}

export function subscriptionStatusVariant(
  status: FinanceSubscriptionStatus
): SubscriptionBadgeVariant {
  if (status === "ACTIVE") {
    return "success"
  }
  if (status === "PAUSED") {
    return "warning"
  }
  return "secondary"
}

export function subscriptionStatusLabel(
  status: FinanceSubscriptionStatus
): string {
  return SUBSCRIPTION_STATUS_LABEL[status] ?? status
}

/** Tabs of the subscription detail, mirroring the card detail. */
export const SUBSCRIPTION_DETAIL_TABS = {
  summary: "summary",
  payments: "payments",
  price: "price",
} as const

export type SubscriptionDetailTab =
  (typeof SUBSCRIPTION_DETAIL_TABS)[keyof typeof SUBSCRIPTION_DETAIL_TABS]

/** Query parameter a link uses to open a detail tab. */
export const SUBSCRIPTION_DETAIL_TAB_PARAM = "tab"

const SUBSCRIPTION_DETAIL_TAB_VALUES: readonly string[] = Object.values(
  SUBSCRIPTION_DETAIL_TABS
)

/** Detail tab a link asks for; summary when it is missing or unknown. */
export function subscriptionDetailTabFromParam(
  value: string | null | undefined
): SubscriptionDetailTab {
  if (value && SUBSCRIPTION_DETAIL_TAB_VALUES.includes(value)) {
    return value as SubscriptionDetailTab
  }
  return SUBSCRIPTION_DETAIL_TABS.summary
}

/**
 * Query string with the detail tab and everything else untouched. The default
 * tab leaves no parameter, so a plain detail URL stays clean.
 */
export function withSubscriptionDetailTab(
  base: string,
  tab: SubscriptionDetailTab
): string {
  const params = new URLSearchParams(base)
  if (tab === SUBSCRIPTION_DETAIL_TABS.summary) {
    params.delete(SUBSCRIPTION_DETAIL_TAB_PARAM)
  } else {
    params.set(SUBSCRIPTION_DETAIL_TAB_PARAM, tab)
  }
  return params.toString()
}

export type SubscriptionCardState = {
  /** Charge date copy: `Hoy`, `Mañana`, `en N días` or the short date. */
  label: string
  /** Inside the warning window: amber border and a place in Próximos. */
  inWindow: boolean
  /** Active subscription whose next charge date already passed. */
  overdue: boolean
  /** The last charge did not match the expected amount. */
  warnLastCharge: boolean
  /** The free trial has not ended: the amount reads as free. */
  onTrial: boolean
}

export function subscriptionCardState(input: {
  subscription: FinanceSubscription
  today: Date
  windowDays: number
}): SubscriptionCardState {
  const { subscription, today } = input
  const label = billingLabel({
    nextDate: subscription.nextBillingDate,
    today,
    windowDays: input.windowDays,
  })
  // A paused or cancelled subscription does not bill, so it never gets the
  // warning highlight or a place in Próximos: it only shows its date.
  const active = subscription.status === "ACTIVE"
  return {
    label: active ? label.text : shortBillingDate(subscription.nextBillingDate),
    inWindow: active && label.inWindow,
    overdue: subscriptionIsOverdue(subscription, today),
    warnLastCharge: subscription.lastChargeMismatch,
    onTrial:
      subscription.trialEndsAt !== null &&
      differenceInCalendarDays(
        startOfDay(parseISO(subscription.trialEndsAt)),
        startOfDay(today)
      ) >= 0,
  }
}

export type SubscriptionShortcutBadges = {
  /** At least one charge inside the window: the dot on Próximos. */
  upcoming: boolean
  alerts: number
  detected: number
}

export function subscriptionShortcutBadges(input: {
  summary: FinanceSubscriptionSummary | null | undefined
  alertCount: number
}): SubscriptionShortcutBadges {
  return {
    upcoming: (input.summary?.upcoming.length ?? 0) > 0,
    alerts: input.alertCount,
    detected: input.summary?.pendingDetectedCount ?? 0,
  }
}

export type SubscriptionAlertView = {
  title: string
  description: string
  badge: string | null
  badgeVariant: "danger" | "warning" | "secondary" | "info"
}

function money(value: string | null, display: FinanceMoneyDisplay): string {
  return formatFinanceMoney(value, display)
}

function signedMoney(value: number, display: FinanceMoneyDisplay): string {
  return formatFinanceMoney(value, { ...display, leadingSign: true })
}
function countdown(daysUntil: number | null): string | null {
  if (daysUntil === null) {
    return null
  }
  if (daysUntil <= 0) {
    return "Hoy"
  }
  return daysUntil === 1 ? "Mañana" : `en ${daysUntil} días`
}

/**
 * Copy of one alert for the Alerts sheet: what happened, the amounts behind it
 * and the badge that stands out on the right.
 */
export function subscriptionAlertView(input: {
  alert: FinanceSubscriptionAlert
  display: FinanceMoneyDisplay
}): SubscriptionAlertView {
  const { alert } = input
  const display = { ...input.display, currency: alert.currency }
  if (alert.kind === "PRICE_INCREASE") {
    return {
      title: `${alert.subscriptionName} subió de precio`,
      description: `${money(alert.previousAmount, display)} → ${money(
        alert.amount,
        display
      )} · desde el cobro del ${alert.date}`,
      badge: alert.percent === null ? null : `+${alert.percent}%`,
      badgeVariant: "danger",
    }
  }
  if (alert.kind === "AMOUNT_MISMATCH") {
    const expected = money(alert.expectedAmount, display)
    const charged = money(alert.amount, display)
    const difference = financeMoneyDifference(
      alert.expectedAmount,
      alert.amount
    )
    return {
      title: `${alert.subscriptionName} cobró distinto`,
      description: `Esperado ${expected} · cobrado ${charged} el ${alert.date}`,
      badge: difference === null ? null : signedMoney(difference, display),
      badgeVariant: "warning",
    }
  }
  if (alert.kind === "TRIAL_ENDING") {
    return {
      title: `La prueba de ${alert.subscriptionName} termina`,
      description: `Vence el ${alert.date} · luego ${money(alert.amount, display)}`,
      badge: countdown(alert.daysUntil),
      badgeVariant: "warning",
    }
  }
  if (alert.kind === "ANNUAL_RENEWAL") {
    return {
      title: `${alert.subscriptionName} se renueva pronto`,
      description: `${alert.date} · ${money(alert.amount, display)}`,
      badge: countdown(alert.daysUntil),
      badgeVariant: "warning",
    }
  }
  return {
    title: `${alert.subscriptionName}: cobro no registrado`,
    description: `Esperado el ${alert.date} · ${money(alert.amount, display)}`,
    badge: "Sin registrar",
    badgeVariant: "secondary",
  }
}

/** Detail tab `Revisar` opens for that alert. */
export function subscriptionAlertReviewTarget(
  kind: FinanceSubscriptionAlertKind
): SubscriptionDetailTab {
  if (kind === "PRICE_INCREASE" || kind === "AMOUNT_MISMATCH") {
    return SUBSCRIPTION_DETAIL_TABS.price
  }
  if (kind === "MISSED_CHARGE") {
    return SUBSCRIPTION_DETAIL_TABS.payments
  }
  return SUBSCRIPTION_DETAIL_TABS.summary
}
