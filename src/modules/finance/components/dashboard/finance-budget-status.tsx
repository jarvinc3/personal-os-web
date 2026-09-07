"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type { FinanceBudgetStatus } from "@/src/modules/finance/types/entities";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

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
        key: row.id,
        label: `${row.icon ? `${row.icon} ` : ""}${row.category}`,
        pctUsed: row.pctUsed,
        spent: row.amountSpent,
        limit: row.amountLimit,
        fill: row.color ?? "var(--color-pctUsed)",
      },
    ]
  })

  if (data.length === 0) {
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full aspect-4/3">
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
        <Bar dataKey="pctUsed" radius={4}>
          {data.map((row) => (
            <Cell key={row.key} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
