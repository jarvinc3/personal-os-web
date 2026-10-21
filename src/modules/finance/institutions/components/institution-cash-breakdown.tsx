"use client"

import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceCashSummary } from "@/src/modules/finance/shared/types/entities"

type InstitutionCashBreakdownProps = {
  cash: FinanceCashSummary
  display: FinanceMoneyDisplay
}

export function InstitutionCashBreakdown({
  cash,
  display,
}: InstitutionCashBreakdownProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-3 py-3">
      <p className="text-sm font-medium text-muted-foreground">Por moneda</p>
      {cash.byCurrency.map((row) => (
        <div
          key={row.currency}
          className="flex items-baseline justify-between gap-2"
        >
          <span className="text-sm font-medium">{row.currency}</span>
          <span className="text-sm tabular-nums">
            {formatFinanceMoney(row.total, {
              ...display,
              currency: row.currency,
            })}
            {row.totalBase === null
              ? " · sin tasa"
              : ` · ${formatFinanceMoney(row.totalBase, display)}`}
          </span>
        </div>
      ))}
      {cash.totalBase === null ? (
        <p className="text-xs text-muted-foreground">
          Balance incompleto: falta una tasa de cambio.
        </p>
      ) : null}
    </div>
  )
}
