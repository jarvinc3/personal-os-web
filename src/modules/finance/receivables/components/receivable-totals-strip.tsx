"use client"

import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { receivableTotalsByCurrency } from "@/src/modules/finance/receivables/lib/receivable-totals"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"

type ReceivableTotalsStripProps = {
  receivables: readonly FinanceReceivable[]
  display: FinanceMoneyDisplay
}

/** Pending and collected money per currency, above the receivables list. */
export function ReceivableTotalsStrip({
  receivables,
  display,
}: ReceivableTotalsStripProps) {
  const totals = receivableTotalsByCurrency(receivables)
  if (totals.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-3 py-3">
      {totals.map((entry) => {
        const money = { ...display, currency: entry.currency }
        return (
          <div
            key={entry.currency}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
          >
            <span className="text-sm font-medium">{entry.currency}</span>
            <span className="flex flex-wrap items-baseline gap-x-3 text-sm tabular-nums">
              <span>
                <span className="text-muted-foreground">Pendiente </span>
                {formatFinanceMoney(String(entry.pending), money)}
              </span>
              <span>
                <span className="text-muted-foreground">Cobrado </span>
                {formatFinanceMoney(String(entry.collected), money)}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
