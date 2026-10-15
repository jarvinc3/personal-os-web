import {
  addDays,
  differenceInCalendarDays,
  startOfDay,
  startOfWeek,
} from "date-fns"

import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceSubscriptionUpcomingCharge } from "@/src/modules/finance/shared/types/entities"

const DAYS_PER_WEEK = 7

const MONTH_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const

/** `Octubre 2026`, the title of the calendar month. */
export function subscriptionMonthLabel(input: {
  year: number
  month: number
}): string {
  const name = MONTH_LONG[input.month - 1]
  if (!name) {
    throw new Error(`Unknown month: ${input.month}`)
  }
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${input.year}`
}

export type SubscriptionCalendarDay = {
  /** ISO date (`YYYY-MM-DD`). */
  date: string
  /** Day of the month, or null for a padding cell. */
  dayNumber: number | null
  inMonth: boolean
  isToday: boolean
  /** Inside the warning window: the day gets a tint. */
  inWindow: boolean
  charges: FinanceSubscriptionUpcomingCharge[]
}

export type SubscriptionCalendarWeek = {
  id: string
  days: SubscriptionCalendarDay[]
}

function isoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Weeks of a month with the charges of each day. Padding cells of the
 * neighbouring months carry a null day number.
 */
export function subscriptionCalendarWeeks(input: {
  year: number
  month: number
  charges: readonly FinanceSubscriptionUpcomingCharge[]
  today: Date
  windowDays: number
  weekStartsOn: 0 | 1
}): SubscriptionCalendarWeek[] {
  const monthStart = new Date(input.year, input.month - 1, 1)
  const monthEnd = new Date(input.year, input.month, 0)
  const today = startOfDay(input.today)
  const byDay = new Map<string, FinanceSubscriptionUpcomingCharge[]>()
  for (const charge of input.charges) {
    const day = byDay.get(charge.date)
    if (day) {
      day.push(charge)
      continue
    }
    byDay.set(charge.date, [charge])
  }

  const weeks: SubscriptionCalendarWeek[] = []
  let cursor = startOfWeek(monthStart, { weekStartsOn: input.weekStartsOn })
  while (cursor.getTime() <= monthEnd.getTime()) {
    const days: SubscriptionCalendarDay[] = []
    for (let offset = 0; offset < DAYS_PER_WEEK; offset += 1) {
      const date = addDays(cursor, offset)
      const inMonth =
        date.getTime() >= monthStart.getTime() &&
        date.getTime() <= monthEnd.getTime()
      const key = isoDate(date)
      const daysUntilCharge = differenceInCalendarDays(startOfDay(date), today)
      days.push({
        date: key,
        dayNumber: inMonth ? date.getDate() : null,
        inMonth,
        isToday: inMonth && daysUntilCharge === 0,
        inWindow:
          inMonth &&
          daysUntilCharge >= 0 &&
          daysUntilCharge <= input.windowDays,
        charges: byDay.get(key) ?? [],
      })
    }
    weeks.push({ id: isoDate(cursor), days })
    cursor = addDays(cursor, DAYS_PER_WEEK)
  }
  return weeks
}

export type SubscriptionMonthSummary = {
  count: number
  /** Total in the base currency, or null when the month mixes currencies. */
  total: string | null
  currency: string
}

/**
 * Charges of one month. Amounts of different currencies are never added on
 * the client, so a mixed month only reports its count.
 */
export function subscriptionChargeSummary(input: {
  charges: readonly FinanceSubscriptionUpcomingCharge[]
  baseCurrency: string
}): SubscriptionMonthSummary {
  const currencies = new Set(input.charges.map((charge) => charge.currency))
  if (currencies.size > 1) {
    return {
      count: input.charges.length,
      total: null,
      currency: input.baseCurrency,
    }
  }
  const total = input.charges.reduce(
    (sum, charge) => sum + (parseFinanceMoney(charge.amount) ?? 0),
    0
  )
  return {
    count: input.charges.length,
    total: total.toFixed(2),
    currency: input.charges[0]?.currency ?? input.baseCurrency,
  }
}

export function subscriptionChargeSummaryLabel(input: {
  summary: SubscriptionMonthSummary
  showCents: boolean
}): string {
  const charges = `${input.summary.count} cobro${input.summary.count === 1 ? "" : "s"}`
  if (input.summary.total === null) {
    return charges
  }
  return `${charges} · ${formatFinanceMoney(input.summary.total, {
    currency: input.summary.currency,
    showCents: input.showCents,
    compactNumbers: false,
  })}`
}

/** Charges of the month that are still ahead, oldest first. */
export function subscriptionRestOfMonth(
  charges: readonly FinanceSubscriptionUpcomingCharge[],
  today: Date
): FinanceSubscriptionUpcomingCharge[] {
  const from = isoDate(startOfDay(today))
  return charges
    .filter((charge) => charge.date >= from)
    .sort((left, right) => left.date.localeCompare(right.date))
}
