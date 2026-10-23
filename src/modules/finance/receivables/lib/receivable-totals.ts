import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"

export type ReceivableCurrencyTotals = {
  currency: string
  pending: number
  collected: number
}

export type ReceivableTotals = {
  totals: ReceivableCurrencyTotals[]
  /** Receivables the API sent with an unreadable amount; they never sum. */
  unreadableIds: string[]
}

export type ReceivableMoney = {
  amount: number
  paid: number
  credit: number
  writtenOff: number
}

/**
 * Every amount a receivable carries, or null when one of them is unreadable.
 * A single broken amount must not throw and take the whole list down.
 */
export function receivableMoney(
  receivable: FinanceReceivable
): ReceivableMoney | null {
  const amount = parseFinanceMoney(receivable.amount)
  const paid = parseFinanceMoney(receivable.paidAmount)
  const credit = parseFinanceMoney(receivable.creditBalance)
  const writtenOff = parseFinanceMoney(receivable.writtenOffAmount)
  if (
    amount === null ||
    paid === null ||
    credit === null ||
    writtenOff === null
  ) {
    return null
  }
  return { amount, paid, credit, writtenOff }
}

function pendingFromMoney(money: ReceivableMoney): number {
  return Math.max(
    0,
    money.amount - money.paid - money.credit - money.writtenOff
  )
}

/** What a receivable still owes after payments, credited and written-off money. */
export function receivablePendingAmount(
  receivable: FinanceReceivable
): number | null {
  const money = receivableMoney(receivable)
  return money === null ? null : pendingFromMoney(money)
}

/**
 * Pending and collected money per currency. A receivable only adds to its own
 * currency, and a partial payment splits between both totals.
 */
export function receivableTotalsByCurrency(
  receivables: readonly FinanceReceivable[]
): ReceivableTotals {
  const byCurrency = new Map<string, ReceivableCurrencyTotals>()
  const unreadableIds: string[] = []

  for (const receivable of receivables) {
    const money = receivableMoney(receivable)
    if (money === null) {
      unreadableIds.push(receivable.id)
      continue
    }
    const currency = receivable.currency.toUpperCase()
    const totals = byCurrency.get(currency) ?? {
      currency,
      pending: 0,
      collected: 0,
    }
    byCurrency.set(currency, {
      currency,
      pending: totals.pending + pendingFromMoney(money),
      collected: totals.collected + money.paid,
    })
  }

  const totals = [...byCurrency.values()].sort((left, right) =>
    left.currency.localeCompare(right.currency)
  )
  return { totals, unreadableIds }
}
