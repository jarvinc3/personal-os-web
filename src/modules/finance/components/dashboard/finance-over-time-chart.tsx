"use client"

import { mapSpendingPointsToChart } from "@/src/modules/finance/lib/chart-series";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type { FinanceSpendingOverTime } from "@/src/modules/finance/types/entities";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  expenses: { label: "Gastos", color: "var(--chart-1)" },
  income: { label: "Ingresos", color: "var(--chart-2)" },
} satisfies ChartConfig

type FinanceOverTimeChartProps = {
  series: FinanceSpendingOverTime | undefined
  display: FinanceMoneyDisplay
}

export function FinanceOverTimeChart({
  series,
  display,
}: FinanceOverTimeChartProps) {
  const data = mapSpendingPointsToChart(series)
  if (
    data.length === 0 ||
    data.every((row) => row.expenses === 0 && row.income === 0)
  ) {
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full aspect-video">
      <LineChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis hide />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex gap-4 justify-between w-full">
                  <span className="text-muted-foreground">
                    {name === "income" ? "Ingresos" : "Gastos"}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatFinanceMoney(
                      typeof value === "number" ? value : String(value),
                      display,
                    )}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="var(--color-expenses)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="var(--color-income)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
