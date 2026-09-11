"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";

export type FinanceSummaryStat = {
  key: string
  label: string
  value: string | null
}

type FinanceSummaryStatsProps = {
  stats: FinanceSummaryStat[]
  display: FinanceMoneyDisplay
}

export function FinanceSummaryStats({
  stats,
  display,
}: FinanceSummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.key} size="sm">
          <CardHeader className="pb-0 border-0">
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-lg tabular-nums">
              {formatFinanceMoney(stat.value, display)}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
