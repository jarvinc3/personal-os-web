import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money.ts"
import type {
  FinanceBalanceSheetCurrencyGroup,
  FinanceBalanceSheetCurrencyTotals,
} from "@/src/modules/finance/shared/types/entities"

/**
 * Pending receivables already included in the currency total. They belong to no
 * institution, so the summary shows them on their own line to explain the gap
 * between the total and the institutions (ADR-005). Doubtful ones do not count.
 */
export function pendingReceivablesAmount(
  totals: FinanceBalanceSheetCurrencyTotals
): number | null {
  const amount = parseFinanceMoney(totals.receivables)
  if (amount === null || amount <= 0) {
    return null
  }
  return amount
}

/** Formatted receivables of a currency group; null when it has none to show. */
export function receivablesLine(
  group: Pick<FinanceBalanceSheetCurrencyGroup, "currency" | "totals">,
  display: FinanceMoneyDisplay
): string | null {
  const amount = pendingReceivablesAmount(group.totals)
  if (amount === null) {
    return null
  }
  return formatFinanceMoney(amount, { ...display, currency: group.currency })
}

/** The group of a currency; null when the currency has no balances. */
export function currencyGroupFor(
  groups: readonly FinanceBalanceSheetCurrencyGroup[],
  currency: string
): FinanceBalanceSheetCurrencyGroup | null {
  const wanted = currency.trim().toUpperCase()
  return (
    groups.find((group) => group.currency.trim().toUpperCase() === wanted) ??
    null
  )
}
