/** GET savings-goals / loans / receivables are arrays after unwrap. */

import { parseFinanceMoney } from "./money.ts"

export function asFinanceArray<T>(payload: unknown): T[] {
  return Array.isArray(payload) ? (payload as T[]) : []
}

export function amountRatioPct(
  numerator: string | number | null | undefined,
  denominator: string | number | null | undefined
): number | null {
  const amount = parseFinanceMoney(numerator)
  const total = parseFinanceMoney(denominator)
  if (amount === null || total === null || total === 0) {
    return null
  }
  return (amount / total) * 100
}

export function joinPlanningCaption(
  ...parts: Array<string | null | undefined>
): string | undefined {
  const listed = parts.map((part) => part?.trim()).filter(Boolean)
  return listed.length > 0 ? listed.join(" · ") : undefined
}

export function loanProgressSummary(input: {
  originalAmount: string
  currentBalance: string
  paidInstallments: number
  totalInstallments: number
}): { paidOff: boolean; progress: number | null } {
  const original = parseFinanceMoney(input.originalAmount)
  const balance = parseFinanceMoney(input.currentBalance)
  const paidDown =
    original !== null && balance !== null ? original - balance : null
  const moneyProgress = amountRatioPct(paidDown, original)
  const installmentProgress =
    input.totalInstallments > 0
      ? (input.paidInstallments / input.totalInstallments) * 100
      : null

  return {
    paidOff: balance !== null && balance <= 0,
    progress: moneyProgress ?? installmentProgress,
  }
}

export function formatPlanningDate(value: string | null | undefined): string {
  if (!value) {
    return ""
  }
  return value.slice(0, 10)
}

export function visibleReceivables<T extends { status: string }>(
  items: T[]
): T[] {
  return items.filter((item) => item.status !== "CANCELLED")
}

/** What is still owed on one cobro; zero when the amount is unreadable. */
export function receivablePending(receivable: {
  amount: string
  paidAmount: string
}): number {
  const amount = parseFinanceMoney(receivable.amount)
  const paid = parseFinanceMoney(receivable.paidAmount)
  if (amount === null) {
    return 0
  }
  return amount - (paid ?? 0)
}

export type SavingsSuggestion = {
  monthlyAmount: number
  months: number
  coveredPct: number
}

function monthsUntil(
  targetDate: string | null | undefined,
  now: Date
): number | null {
  if (!targetDate) {
    return null
  }
  const target = new Date(`${targetDate.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(target.getTime())) {
    return null
  }
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  return months > 0 ? months : null
}

/**
 * What to set aside each month to reach a goal on time. Null when there is no
 * target date, the goal is already covered, or the date has passed.
 */
export function monthlySavingsSuggestion({
  targetAmount,
  currentAmount,
  targetDate,
  now,
}: {
  targetAmount: string | number | null | undefined
  currentAmount: string | number | null | undefined
  targetDate: string | null | undefined
  now: Date
}): SavingsSuggestion | null {
  const target = parseFinanceMoney(targetAmount)
  const saved = parseFinanceMoney(currentAmount)
  if (target === null || saved === null || target <= 0) {
    return null
  }
  const remaining = target - saved
  if (remaining <= 0) {
    return null
  }
  const months = monthsUntil(targetDate, now)
  if (months === null) {
    return null
  }
  return {
    monthlyAmount: remaining / months,
    months,
    coveredPct: (saved / target) * 100,
  }
}
