"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type { FinanceAnalyticsSummary } from "@/src/modules/finance/types/entities";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";

type FinanceSummaryStatsProps = {
  summary: FinanceAnalyticsSummary
  display: FinanceMoneyDisplay
}

const STATS: {
  key: string
  label: string
  value: (summary: FinanceAnalyticsSummary) => string
}[] = [
    { key: "accountBalance", label: "Cuentas", value: (s) => s.totals.accountBalance },
    { key: "cardDebt", label: "Deuda tarjetas", value: (s) => s.totals.cardDebt },
    { key: "income", label: "Ingresos", value: (s) => s.totals.income },
    { key: "expenses", label: "Gastos", value: (s) => s.totals.expenses },
  ]

export function FinanceSummaryStats({
  summary,
  display,
}: FinanceSummaryStatsProps) {
  const moneyDisplay = { ...display, currency: summary.baseCurrency }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.key} size="sm">
          <CardHeader className="pb-0 border-0">
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-lg tabular-nums">
              {formatFinanceMoney(stat.value(summary), moneyDisplay)}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
