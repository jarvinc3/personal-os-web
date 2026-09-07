"use client"

import { mapSpendingBucketsToChart } from "@/src/modules/finance/lib/chart-series";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type { FinanceSpendingBucket } from "@/src/modules/finance/types/entities";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

type FinanceSpendingChartProps = {
  buckets: FinanceSpendingBucket[]
  display: FinanceMoneyDisplay
}

export function FinanceSpendingChart({
  buckets,
  display,
}: FinanceSpendingChartProps) {
  const data = mapSpendingBucketsToChart(buckets)
  if (data.length === 0 || data.every((row) => row.total === 0)) {
    return null
  }

  const chartConfig: ChartConfig = {
    total: { label: "Gasto" },
  }
  for (const row of data) {
    chartConfig[row.key] = { label: row.label, color: row.fill }
  }

  return (
    <ChartContainer config={chartConfig} className="w-full aspect-4/3">
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} />
        <YAxis hide />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                formatFinanceMoney(
                  typeof value === "number" ? value : String(value),
                  display,
                )
              }
            />
          }
        />
        <Bar dataKey="total" radius={4}>
          {data.map((row) => (
            <Cell key={row.key} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
