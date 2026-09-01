"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import type { FinanceBudgetStatus } from "@/src/modules/finance/types/entities"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  pctUsed: { label: "% usado", color: "var(--chart-3)" },
} satisfies ChartConfig

type FinanceBudgetStatusChartProps = {
  rows: FinanceBudgetStatus[]
  display: FinanceMoneyDisplay
}

export function FinanceBudgetStatusChart({
  rows,
  display,
}: FinanceBudgetStatusChartProps) {
  if (rows.length === 0) {
    return null
  }

  const data = rows.flatMap((row) => {
    if (!Number.isFinite(row.pctUsed)) {
      return []
    }
    return [
      {
        label: row.category,
        pctUsed: row.pctUsed,
        spent: row.amountSpent,
        limit: row.amountLimit,
      },
    ]
  })

  if (data.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Presupuestos</h2>
      <ChartContainer config={chartConfig} className="aspect-[4/3] w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 8 }}>
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            width={96}
          />
          <XAxis type="number" hide />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => {
                  const payload = item.payload as {
                    spent?: string
                    limit?: string
                  }
                  return (
                    <span className="tabular-nums">
                      {typeof value === "number" ? `${value.toFixed(0)}%` : String(value)}
                      {" · "}
                      {formatFinanceMoney(payload.spent, display)} /{" "}
                      {formatFinanceMoney(payload.limit, display)}
                    </span>
                  )
                }}
              />
            }
          />
          <Bar dataKey="pctUsed" fill="var(--color-pctUsed)" radius={4} />
        </BarChart>
      </ChartContainer>
    </section>
  )
}
