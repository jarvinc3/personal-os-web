import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  parseISO,
  startOfDay,
} from "date-fns"

import { shortMonthLabel } from "@/src/shared/lib/date-format"
import type { FinanceBillingCycle } from "@/src/modules/finance/shared/types/entities"
import type { SubscriptionCardSource } from "./subscription-card-source.ts"

/** `mar 2023`, the month and year a subscription started. */
export function billingMonthLabel(
  value: Date | string,
  locale: string
): string {
  const date = typeof value === "string" ? parseISO(value) : value
  return `${shortMonthLabel(date, locale)} ${date.getFullYear()}`
}

export type SubscriptionCycleProgress = {
  startDate: Date
  endDate: Date
  /** Whole days elapsed in the current cycle. */
  elapsedDays: number
  cycleDays: number
  /** 0–1, clamped. */
  ratio: number
  /** 0–100, clamped. */
  percent: number
}

/** `17 oct`, the short date a card shows outside the warning window. */
export function shortBillingDate(value: Date | string, locale: string): string {
  const date = typeof value === "string" ? parseISO(value) : value
  return `${date.getDate()} ${shortMonthLabel(date, locale)}`
}

/**
 * How far a cycle has run, from its start to its next charge. Out-of-range
 * dates clamp, so a card never paints a ring past its ends.
 */
export function cycleProgress(input: {
  start: Date
  next: Date
  today: Date
}): SubscriptionCycleProgress {
  const startDate = startOfDay(input.start)
  const endDate = startOfDay(input.next)
  const cycleDays = Math.max(1, differenceInCalendarDays(endDate, startDate))
  const elapsedDays = differenceInCalendarDays(
    startOfDay(input.today),
    startDate
  )
  const ratio = Math.min(1, Math.max(0, elapsedDays / cycleDays))
  return {
    startDate,
    endDate,
    elapsedDays,
    cycleDays,
    ratio,
    percent: ratio * 100,
  }
}

function cycleStart(input: {
  billingCycle: FinanceBillingCycle
  billingInterval: number
  nextBillingDate: string
}): Date {
  const next = startOfDay(parseISO(input.nextBillingDate))
  const interval = input.billingInterval
  switch (input.billingCycle) {
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
 * Cycle progress of a subscription. The anchor is not used so a month-end
 * cycle still measures the real days of that month. A charge of the upcoming
 * endpoint has no cycle to measure, so it has no progress.
 */
export function subscriptionCycleProgress(
  subscription: SubscriptionCardSource,
  now: Date
): SubscriptionCycleProgress | null {
  if (subscription.billingCycle === null) {
    return null
  }
  return cycleProgress({
    start: cycleStart({
      billingCycle: subscription.billingCycle,
      billingInterval: subscription.billingInterval,
      nextBillingDate: subscription.nextBillingDate,
    }),
    next: parseISO(subscription.nextBillingDate),
    today: now,
  })
}

export type BillingLabel = {
  text: string
  /** True when the charge falls inside the warning window. */
  inWindow: boolean
}

/**
 * Copy and highlight of a charge date: `Hoy`, `Mañana` or `en N días` inside
 * the window, the short date outside it.
 */
/** An active subscription whose next charge date already passed unpaid. */
export function subscriptionIsOverdue(
  subscription: Pick<SubscriptionCardSource, "status" | "nextBillingDate">,
  today: Date
): boolean {
  if (subscription.status !== "ACTIVE") {
    return false
  }
  const next = startOfDay(parseISO(subscription.nextBillingDate))
  return differenceInCalendarDays(next, startOfDay(today)) < 0
}

export function billingLabel(input: {
  nextDate: Date | string
  today: Date
  windowDays: number
  locale: string
}): BillingLabel {
  const next = startOfDay(
    typeof input.nextDate === "string"
      ? parseISO(input.nextDate)
      : input.nextDate
  )
  const days = differenceInCalendarDays(next, startOfDay(input.today))
  if (days < 0 || days > input.windowDays) {
    return { text: shortBillingDate(next, input.locale), inWindow: false }
  }
  if (days === 0) {
    return { text: "Hoy", inWindow: true }
  }
  if (days === 1) {
    return { text: "Mañana", inWindow: true }
  }
  return { text: `en ${days} días`, inWindow: true }
}
