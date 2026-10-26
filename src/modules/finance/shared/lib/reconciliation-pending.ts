import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "./money.ts"
import type { FinanceReconciliationStatusItem } from "@/src/modules/finance/shared/types/entities"

/**
 * Products this month's reconciliation still has to cover. A product with a
 * zero balance has nothing to compare against the bank, so it is not listed.
 */
export function pendingReconciliationItems(
  items: readonly FinanceReconciliationStatusItem[]
): FinanceReconciliationStatusItem[] {
  return items.filter((item) => {
    if (item.reconciled) {
      return false
    }
    return parseFinanceMoney(item.balance) !== 0
  })
}

/**
 * Line under the product name: its institution only when it adds information
 * and the balance, which already carries the currency code.
 */
export function reconciliationSubtitle(
  item: FinanceReconciliationStatusItem,
  display: FinanceMoneyDisplay
): string {
  const amount = formatFinanceMoney(item.balance, {
    ...display,
    currency: item.currency,
  })
  const institution = item.institutionName?.trim() ?? ""
  const repeatsName =
    institution.toLowerCase() === item.name.trim().toLowerCase()
  if (!institution || repeatsName) {
    return amount
  }
  return `${institution} · ${amount}`
}
