import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"

type FinanceFlowPillsProps = {
  income: number
  expenses: number
  display: FinanceMoneyDisplay
}

export function FinanceFlowPills({
  income,
  expenses,
  display,
}: FinanceFlowPillsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div
        aria-label="Ingresos del mes"
        className="rounded-2xl border border-border bg-card px-3 py-2"
      >
        <p className="text-xs text-muted-foreground">Ingresos</p>
        <p className="text-sm font-semibold tabular-nums text-success">
          + {formatFinanceMoney(income, display)}
        </p>
      </div>
      <div
        aria-label="Gastos del mes"
        className="rounded-2xl border border-border bg-card px-3 py-2 text-right"
      >
        <p className="text-xs text-muted-foreground">Gastos</p>
        <p className="text-sm font-semibold tabular-nums text-destructive">
          − {formatFinanceMoney(expenses, display)}
        </p>
      </div>
    </div>
  )
}
