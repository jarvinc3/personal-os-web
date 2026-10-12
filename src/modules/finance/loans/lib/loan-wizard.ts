import {
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarMonths,
} from "date-fns"

import type { FinanceInstallmentFreq } from "@/src/modules/finance/shared/types/entities"

export const LOAN_PERIODS_PER_YEAR: Record<FinanceInstallmentFreq, number> = {
  WEEKLY: 52,
  BIWEEKLY: 26,
  MONTHLY: 12,
}

const CENTS = 100
const MAX_ANNUAL_RATE = 3
const RATE_SEARCH_STEPS = 80

export function roundToCents(value: number): number {
  return Math.round(value * CENTS) / CENTS
}

export function periodicRate(
  annualRate: number,
  freq: FinanceInstallmentFreq
): number {
  return annualRate / LOAN_PERIODS_PER_YEAR[freq]
}

export function installmentAmount(input: {
  principal: number
  annualRate: number
  periods: number
  freq: FinanceInstallmentFreq
}): number {
  const { principal, annualRate, periods, freq } = input
  if (principal <= 0 || periods <= 0) {
    return 0
  }
  const rate = periodicRate(annualRate, freq)
  if (rate === 0) {
    return principal / periods
  }
  const growth = (1 + rate) ** periods
  return (principal * rate * growth) / (growth - 1)
}

export function outstandingBalance(input: {
  principal: number
  annualRate: number
  periods: number
  paidPeriods: number
  freq: FinanceInstallmentFreq
}): number {
  const { principal, annualRate, periods, paidPeriods, freq } = input
  const paid = Math.min(Math.max(paidPeriods, 0), periods)
  const installment = installmentAmount({
    principal,
    annualRate,
    periods,
    freq,
  })
  const rate = periodicRate(annualRate, freq)
  if (rate === 0) {
    return Math.max(0, principal - installment * paid)
  }
  const growth = (1 + rate) ** paid
  return Math.max(0, principal * growth - installment * ((growth - 1) / rate))
}

/** Finds the annual rate that produces the given instalment, or null when none fits. */
export function annualRateFromInstallment(input: {
  principal: number
  installment: number
  periods: number
  freq: FinanceInstallmentFreq
}): number | null {
  const { principal, installment, periods, freq } = input
  if (principal <= 0 || installment <= 0 || periods <= 0) {
    return null
  }
  const zeroRateInstallment = principal / periods
  if (installment <= zeroRateInstallment) {
    return 0
  }
  let low = 0
  let high = MAX_ANNUAL_RATE
  const topInstallment = installmentAmount({
    principal,
    annualRate: high,
    periods,
    freq,
  })
  if (topInstallment < installment) {
    return null
  }
  for (let step = 0; step < RATE_SEARCH_STEPS; step += 1) {
    const mid = (low + high) / 2
    const candidate = installmentAmount({
      principal,
      annualRate: mid,
      periods,
      freq,
    })
    if (candidate > installment) {
      high = mid
    } else {
      low = mid
    }
  }
  return (low + high) / 2
}

export function periodsElapsed(input: {
  freq: FinanceInstallmentFreq
  from: Date
  to: Date
}): number {
  const { freq, from, to } = input
  if (to <= from) {
    return 0
  }
  if (freq === "MONTHLY") {
    return differenceInCalendarMonths(to, from)
  }
  const days = differenceInCalendarDays(to, from)
  return Math.floor(days / (freq === "WEEKLY" ? 7 : 14))
}

export function dueDateAfter(input: {
  freq: FinanceInstallmentFreq
  from: Date
  periods: number
}): Date {
  const { freq, from, periods } = input
  if (freq === "MONTHLY") {
    return addMonths(from, periods)
  }
  return addWeeks(from, periods * (freq === "WEEKLY" ? 1 : 2))
}

type KnownRate = { known: "RATE"; annualRatePercent: number }
type KnownInstallment = { known: "INSTALLMENT"; installmentAmount: number }

export type LoanPlanInput = {
  principal: number
  periods: number
  freq: FinanceInstallmentFreq
  disbursementDate: Date
  now: Date
} & (KnownRate | KnownInstallment)

export type LoanPlan = {
  installmentAmount: number
  annualRate: number
  paidPeriods: number
  outstandingBalance: number
  nextDueDate: Date
  totalInterest: number
}

/** Derives instalment, paid periods, balance and next due date from what the user knows. */
export function computeLoanPlan(input: LoanPlanInput): LoanPlan | null {
  const { principal, periods, freq, disbursementDate, now } = input
  if (principal <= 0 || periods <= 0) {
    return null
  }
  let annualRate: number
  let installment: number
  if (input.known === "RATE") {
    annualRate = Math.max(0, input.annualRatePercent) / 100
    installment = installmentAmount({ principal, annualRate, periods, freq })
  } else {
    installment = input.installmentAmount
    const solved = annualRateFromInstallment({
      principal,
      installment,
      periods,
      freq,
    })
    if (solved === null) {
      return null
    }
    annualRate = solved
  }
  const paidPeriods = Math.min(
    periodsElapsed({ freq, from: disbursementDate, to: now }),
    periods
  )
  return {
    installmentAmount: roundToCents(installment),
    annualRate,
    paidPeriods,
    outstandingBalance: roundToCents(
      outstandingBalance({ principal, annualRate, periods, paidPeriods, freq })
    ),
    nextDueDate: dueDateAfter({
      freq,
      from: disbursementDate,
      periods: paidPeriods + 1,
    }),
    totalInterest: roundToCents(installment * periods - principal),
  }
}
