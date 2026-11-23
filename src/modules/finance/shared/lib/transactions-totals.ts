import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { parseFinanceMoney } from "./money.ts"
import {
  isInactiveTransactionStatus,
  isTransferTransaction,
} from "./transactions-predicates.ts"
import { OPERATION_LEG_ROLE } from "./transactions-signs.ts"

type TotalsSource = Pick<
  FinanceTransaction,
  | "type"
  | "amount"
  | "currency"
  | "amountBaseCurrency"
  | "transferGroupId"
  | "status"
  | "legs"
>

function amountForTotals(
  item: Pick<FinanceTransaction, "amount" | "currency" | "amountBaseCurrency">,
  currency?: string
): number | null {
  if (!currency) {
    return parseFinanceMoney(item.amountBaseCurrency)
  }
  if (item.currency !== currency) {
    return null
  }
  return parseFinanceMoney(item.amount)
}

export function visibleTransactionTotals(
  items: TotalsSource[],
  currency?: string
): { income: number; expenses: number } {
  return items.reduce(
    (totals, item) => {
      for (const leg of item.legs ?? []) {
        if (
          leg.legRole !== OPERATION_LEG_ROLE.FEE ||
          isInactiveTransactionStatus(leg.status)
        ) {
          continue
        }
        const fee = amountForTotals(leg, currency)
        if (fee === null) {
          continue
        }
        totals.expenses += fee
      }
      if (
        isTransferTransaction(item) ||
        isInactiveTransactionStatus(item.status)
      ) {
        return totals
      }
      const amount = amountForTotals(item, currency)
      if (amount === null) {
        return totals
      }
      if (item.type === "CREDIT") {
        totals.income += amount
      }
      if (item.type === "DEBIT") {
        totals.expenses += amount
      }
      return totals
    },
    { income: 0, expenses: 0 }
  )
}
