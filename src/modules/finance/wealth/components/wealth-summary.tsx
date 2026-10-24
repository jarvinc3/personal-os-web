"use client"

import { GlossaryHelpButton } from "@/src/modules/help"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceBalanceSheetCurrencyTotalsBase,
  FinanceBalanceSheetSlice,
} from "@/src/modules/finance/shared/types/entities"
import { TriangleAlertIcon } from "lucide-react"

type WealthSummaryProps = {
  global: FinanceBalanceSheetSlice
  totals: FinanceBalanceSheetCurrencyTotalsBase | null
  display: FinanceMoneyDisplay
}

function amountLabel(
  value: string | null,
  display: FinanceMoneyDisplay
): string {
  if (value === null) {
    return "—"
  }
  return formatFinanceMoney(value, display)
}

export function WealthSummary({ global, totals, display }: WealthSummaryProps) {
  const netWorth =
    global.netWorth === null
      ? "Balance incompleto"
      : formatFinanceMoney(global.netWorth, {
          ...display,
          leadingSign: true,
        })

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Patrimonio neto
        </p>
        <GlossaryHelpButton slug="patrimonio" />
      </div>
      <p className="text-3xl font-bold tracking-tight tabular-nums">
        {netWorth}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Disponible</p>
            <GlossaryHelpButton slug="disponible" />
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {amountLabel(totals?.available ?? null, display)}
          </p>
        </div>
        <div className="rounded-2xl bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Por cobrar</p>
            <GlossaryHelpButton slug="por-cobrar" />
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {amountLabel(totals?.receivables ?? null, display)}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        El patrimonio incluye los cobros vigentes. Los cobros dudosos van aparte
        y no suman.
      </p>

      {global.status === "INCOMPLETE" ? (
        <p className="flex items-start gap-2 rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          Falta una tasa de cambio o el límite de una tarjeta. El total queda
          incompleto hasta completarlos.
        </p>
      ) : null}
    </section>
  )
}
