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

/**
 * Currency the ring starts on: the base one when it has something to draw, and
 * otherwise the first one that does.
 */
export function currencyWithBalance(
  groups: readonly FinanceBalanceSheetCurrencyGroup[],
  preferred: string
): string | null {
  const hasBalance = (group: FinanceBalanceSheetCurrencyGroup) => {
    const assets = parseFinanceMoney(group.totals.assets) ?? 0
    const liabilities = parseFinanceMoney(group.totals.liabilities) ?? 0
    return assets !== 0 || liabilities !== 0
  }
  const preferredGroup = currencyGroupFor(groups, preferred)
  if (preferredGroup && hasBalance(preferredGroup)) {
    return preferredGroup.currency
  }
  return groups.find(hasBalance)?.currency ?? null
}
