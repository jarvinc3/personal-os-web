"use client"

import {
  chartConfig,
  chartPoints,
} from "@/src/modules/ai/components/blocks/chat-chart-data"
import { chatMoneyDisplay } from "@/src/modules/ai/components/blocks/chat-money"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"
import { formatFinanceMoney } from "@/src/modules/finance"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/shared/components/ui/chart"
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts"

type ChatChartProps = {
  block: Extract<ChatBlock, { type: "chart" }>
}

export function ChatChart({ block }: ChatChartProps) {
  const points = chartPoints(block.series)
  const config = chartConfig(block.title)
  const formatValue = (value: unknown) =>
    formatFinanceMoney(String(value ?? ""), chatMoneyDisplay(block.currency))
  const ariaLabel = block.title ?? "Gráfico"

  if (block.kind === "donut") {
    return (
      <div className="rounded-2xl border border-border bg-card p-3">
        {block.title ? (
          <p className="mb-1 text-sm font-medium">{block.title}</p>
        ) : null}
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-56"
          role="img"
          aria-label={ariaLabel}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent nameKey="label" formatter={formatValue} />
              }
            />
            <Pie
              data={points}
              dataKey="value"
              nameKey="label"
              innerRadius={44}
              outerRadius={72}
            >
              {points.map((entry, index) => (
                <Cell key={`${entry.label}-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    )
  }

  if (block.kind === "bar") {
    return (
      <div className="rounded-2xl border border-border bg-card p-3">
        {block.title ? (
          <p className="mb-1 text-sm font-medium">{block.title}</p>
        ) : null}
        <ChartContainer
          config={config}
          className="max-h-56"
          role="img"
          aria-label={ariaLabel}
        >
          <BarChart data={points}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip
              content={<ChartTooltipContent formatter={formatValue} />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      {block.title ? (
        <p className="mb-1 text-sm font-medium">{block.title}</p>
      ) : null}
      <ChartContainer
        config={config}
        className="max-h-56"
        role="img"
        aria-label={ariaLabel}
      >
        <LineChart data={points}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <ChartTooltip
            content={<ChartTooltipContent formatter={formatValue} />}
          />
          <Line
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
