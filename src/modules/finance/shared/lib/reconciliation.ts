import { parseFinanceMoney } from "./money.ts"
import type {
  FinanceReconciliationKind,
  FinanceReconciliationLineDraft,
  FinanceReconciliationSuggestedAdjustment,
} from "@/src/modules/finance/shared/types/entities"

export const EMPTY_RECONCILIATION_LINE: FinanceReconciliationLineDraft = {
  kind: "OTRO",
  amount: "",
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Signed difference between the bank balance and the app balance. */
export function reconciliationDifference(
  appBalance: string | number | null | undefined,
  realBalance: string | number | null | undefined
): number | null {
  const app = parseFinanceMoney(appBalance)
  const real = parseFinanceMoney(realBalance)
  if (app === null || real === null) {
    return null
  }
  return roundMoney(real - app)
}

/** Sum of the entered lines, ignoring lines without a parsable amount. */
export function reconciliationLinesTotal(
  lines: readonly FinanceReconciliationLineDraft[]
): number {
  return roundMoney(
    lines.reduce((total, line) => {
      const amount = parseFinanceMoney(line.amount)
      return amount === null ? total : total + amount
    }, 0)
  )
}

export function reconciliationLinesMatchDifference(
  lines: readonly FinanceReconciliationLineDraft[],
  difference: number | null
): boolean {
  if (difference === null) {
    return false
  }
  return reconciliationLinesTotal(lines) === roundMoney(difference)
}

/** Payload lines for the API; empty amounts become zero and are dropped. */
export function reconciliationLinePayloads(
  lines: readonly FinanceReconciliationLineDraft[]
): Array<{ kind: FinanceReconciliationKind; amount: number }> {
  return lines.flatMap((line) => {
    const amount = parseFinanceMoney(line.amount)
    if (amount === null || amount === 0) {
      return []
    }
    return [{ kind: line.kind, amount: roundMoney(amount) }]
  })
}

/** Lines prefilled with the server suggestion, ready for the form. */
export function reconciliationLinesFromSuggestion(
  suggested: readonly FinanceReconciliationSuggestedAdjustment[]
): FinanceReconciliationLineDraft[] {
  if (suggested.length === 0) {
    return [{ ...EMPTY_RECONCILIATION_LINE }]
  }
  return suggested.map((adjustment) => ({
    kind: adjustment.kind,
    amount: adjustment.amount,
  }))
}

/** `YYYY-MM` of an ISO date, for the month-status query. */
export function reconciliationMonth(isoDate: string): string {
  return isoDate.slice(0, 7)
}
