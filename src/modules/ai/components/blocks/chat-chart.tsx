"use client"

import { chatMoneyDisplay } from "@/src/modules/ai/components/blocks/chat-money"
import type {
  ChatBlock,
  ChatChartPoint,
} from "@/src/modules/ai/types/chat.types"
import { formatFinanceMoney } from "@/src/modules/finance"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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

const CHART_PALETTE = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
]

type ChartPointValue = {
  label: string
  value: number
  color: string
}

function toChartPoints(series: ChatChartPoint[]): ChartPointValue[] {
  return series.map((point, index) => ({
    label: point.label,
    value: Number(point.value) || 0,
    color: point.color ?? CHART_PALETTE[index % CHART_PALETTE.length],
  }))
}

function chartConfig(
  block: Extract<ChatBlock, { type: "chart" }>
): ChartConfig {
  return {
    value: {
      label: block.title ?? "Monto",
      color: CHART_PALETTE[0],
    },
  }
}

function tooltipFormatter(currency: string | undefined) {
  return (value: unknown) =>
    formatFinanceMoney(String(value ?? ""), chatMoneyDisplay(currency))
}

type ChatChartProps = {
  block: Extract<ChatBlock, { type: "chart" }>
}

export function ChatChart({ block }: ChatChartProps) {
  const points = toChartPoints(block.series)
  const config = chartConfig(block)
  const formatValue = tooltipFormatter(block.currency)
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
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={points}
              dataKey="value"
              nameKey="label"
              innerRadius={44}
              outerRadius={72}
            >
              {points.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
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
