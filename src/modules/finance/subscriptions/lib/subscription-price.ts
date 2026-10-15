import { subMonths } from "date-fns"

import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceSubscriptionPayment } from "@/src/modules/finance/shared/types/entities"

export type SubscriptionPricePoint = {
  /** ISO date (`YYYY-MM-DD`) of the first charge at that amount. */
  date: string
  amount: number
}

export type SubscriptionPriceChange = {
  date: string
  amount: number
  /** Amount in effect before this charge; null on the first one. */
  previousAmount: number | null
  /** Signed change over the previous amount, one decimal. */
  percent: number | null
}

export type SubscriptionPriceHistory = {
  /** Oldest to newest, one point per amount. */
  series: SubscriptionPricePoint[]
  /** Newest first, with the first amount last. */
  changes: SubscriptionPriceChange[]
}

function dateOnly(value: string): string {
  return value.slice(0, 10)
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10
}

/**
 * Price history derived from the charges: the subscription has no change log,
 * so an amount that repeats is the same price and only the first charge at a
 * new amount counts as a change.
 */
export function subscriptionPriceHistory(
  payments: readonly FinanceSubscriptionPayment[]
): SubscriptionPriceHistory {
  const oldestFirst = [...payments].sort(
    (left, right) =>
      left.paidAt.localeCompare(right.paidAt) || left.id.localeCompare(right.id)
  )
  const series: SubscriptionPricePoint[] = []
  const changes: SubscriptionPriceChange[] = []

  for (const payment of oldestFirst) {
    const amount = parseFinanceMoney(payment.amount)
    if (amount === null) {
      continue
    }
    const previous = series.at(-1)
    if (previous && previous.amount === amount) {
      continue
    }
    const date = dateOnly(payment.paidAt)
    series.push({ date, amount })
    changes.push({
      date,
      amount,
      previousAmount: previous?.amount ?? null,
      percent:
        previous && previous.amount > 0
          ? roundPercent(((amount - previous.amount) / previous.amount) * 100)
          : null,
    })
  }

  return { series, changes: changes.reverse() }
}

/**
 * How much the current price moved against the price in effect N months ago.
 */
export function priceChangeOverMonths(input: {
  series: readonly SubscriptionPricePoint[]
  months: number
  today: Date
}): number | null {
  const latest = input.series.at(-1)
  if (!latest) {
    return null
  }
  const cutoff = dateOnly(subMonths(input.today, input.months).toISOString())
  const then = [...input.series].reverse().find((point) => point.date <= cutoff)
  if (!then || then.amount <= 0) {
    return null
  }
  return roundPercent(((latest.amount - then.amount) / then.amount) * 100)
}
