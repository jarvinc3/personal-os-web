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
  const amount = requireMoney(receivable, "amount")
  const paid = requireMoney(receivable, "paidAmount")
  const credit = requireMoney(receivable, "creditBalance")
  const writtenOff = requireMoney(receivable, "writtenOffAmount")
  return Math.max(0, amount - paid - credit - writtenOff)
}

/** A receivable amount the API always sends; an unreadable one is a bug. */
function requireMoney(
  receivable: FinanceReceivable,
  field: "amount" | "paidAmount" | "creditBalance" | "writtenOffAmount"
): number {
  const parsed = parseFinanceMoney(receivable[field])
  if (parsed === null) {
    throw new Error(
      `Cobro ${receivable.id} con ${field} ilegible: "${receivable[field]}"`
    )
  }
  return parsed
}
