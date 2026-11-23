import { formatFinanceDateTimeLabel } from "./ledger-form.ts"

export * from "./transactions-query-params.ts"
export * from "./transactions-predicates.ts"
export * from "./transactions-signs.ts"
export * from "./transactions-totals.ts"
export * from "./transactions-timeline.ts"

export function formatTransactionDate(value: string, locale: string): string {
  return formatFinanceDateTimeLabel(value, locale)
}
