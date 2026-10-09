import { formatMonthYearLabel } from "../../../shared/lib/date-format.ts"

import type { FinanceTransaction } from "../types/entities.ts"
import { calendarDateFromTransaction } from "./group-transactions-timeline.ts"
import { monthKey } from "./month-window.ts"
import { visibleTransactionTotals } from "./transactions-query.ts"

export type TransactionMonthGroup = {
  key: string
  label: string
  income: number
  expenses: number
  items: FinanceTransaction[]
}

function compareNewestFirst(
  left: FinanceTransaction,
  right: FinanceTransaction
): number {
  const leftKey = left.transactionDate.slice(0, 10)
  const rightKey = right.transactionDate.slice(0, 10)
  return rightKey.localeCompare(leftKey) || right.id.localeCompare(left.id)
}

export function groupTransactionsByMonth(
  items: readonly FinanceTransaction[]
): TransactionMonthGroup[] {
  const byMonth = new Map<string, FinanceTransaction[]>()
  for (const item of items) {
    const date = calendarDateFromTransaction(item.transactionDate)
    if (!date) {
      continue
    }
    const key = monthKey(date.getFullYear(), date.getMonth() + 1)
    const bucket = byMonth.get(key)
    if (bucket) {
      bucket.push(item)
      continue
    }
    byMonth.set(key, [item])
  }

  return [...byMonth.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([key, monthItems]) => {
      const sorted = monthItems.slice().sort(compareNewestFirst)
      const totals = visibleTransactionTotals(sorted)
      const [year, month] = key.split("-").map(Number)
      return {
        key,
        label: formatMonthYearLabel(new Date(year, month - 1, 1)),
        income: totals.income,
        expenses: totals.expenses,
        items: sorted,
      }
    })
}
