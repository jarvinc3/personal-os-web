import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"

export type ReceivableCurrencyTotals = {
  currency: string
  pending: number
  collected: number
}

/**
 * Pending and collected money per currency. A receivable only adds to its own
 * currency, and a partial payment splits between both totals.
 */
export function receivableTotalsByCurrency(
  receivables: readonly FinanceReceivable[]
): ReceivableCurrencyTotals[] {
  const byCurrency = new Map<string, ReceivableCurrencyTotals>()

  for (const receivable of receivables) {
    const currency = receivable.currency.toUpperCase()
    const totals = byCurrency.get(currency) ?? {
      currency,
      pending: 0,
      collected: 0,
    }
    byCurrency.set(currency, {
      currency,
      pending: totals.pending + pendingAmount(receivable),
      collected:
        totals.collected + (parseFinanceMoney(receivable.paidAmount) ?? 0),
    })
  }

  return [...byCurrency.values()].sort((left, right) =>
    left.currency.localeCompare(right.currency)
  )
}

function pendingAmount(receivable: FinanceReceivable): number {
  const amount = parseFinanceMoney(receivable.amount) ?? 0
  const paid = parseFinanceMoney(receivable.paidAmount) ?? 0
  const credit = parseFinanceMoney(receivable.creditBalance) ?? 0
  const writtenOff = parseFinanceMoney(receivable.writtenOffAmount) ?? 0
  return Math.max(0, amount - paid - credit - writtenOff)
}
