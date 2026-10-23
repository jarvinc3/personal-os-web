"use client"

import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { receivableTotalsByCurrency } from "@/src/modules/finance/receivables/lib/receivable-totals"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import { InfoIcon } from "lucide-react"

type ReceivableTotalsStripProps = {
  receivables: readonly FinanceReceivable[]
  display: FinanceMoneyDisplay
}

/** Pending and collected money per currency, above the receivables list. */
export function ReceivableTotalsStrip({
  receivables,
  display,
}: ReceivableTotalsStripProps) {
  const { totals, unreadableIds } = receivableTotalsByCurrency(receivables)
  if (totals.length === 0 && unreadableIds.length === 0) {
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

      {unreadableIds.length > 0 ? (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {unreadableIds.length === 1
              ? "Un cobro no se pudo leer y no suma a los totales."
              : `${unreadableIds.length} cobros no se pudieron leer y no suman a los totales.`}
          </span>
        </p>
      ) : null}
    </div>
  )
}
