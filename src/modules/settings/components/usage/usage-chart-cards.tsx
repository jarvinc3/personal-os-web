"use client"

import {
  formatUsageCost,
  formatUsageCostAxis,
  formatUsageCount,
} from "@/src/modules/intelligence"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart"
import { ChartColumnIcon, CircleDollarSignIcon, CpuIcon } from "lucide-react"
import type { ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

const CALLS_CONFIG = {
  calls: { label: "Clasificaciones", color: "var(--chart-1)" },
} satisfies ChartConfig

const TOKENS_CONFIG = {
  inputTokens: { label: "Entrada", color: "var(--chart-2)" },
  outputTokens: { label: "Salida", color: "var(--chart-3)" },
} satisfies ChartConfig

const COST_CONFIG = {
  costUsd: { label: "Costo estimado", color: "var(--chart-4)" },
} satisfies ChartConfig

export type UsageChartRow = {
  label: string
  calls: number
  inputTokens: number
  outputTokens: number
  costUsd: number
}

type UsageChartProps = {
  rows: UsageChartRow[]
  periodLabel: string
  locale: string
}

export function UsageCallsChart({ rows, periodLabel }: UsageChartProps) {
  return (
    <UsageChartCard
      title="Clasificaciones"
      description="Llamadas registradas."
      icon={ChartColumnIcon}
    >
      <ChartContainer
        config={CALLS_CONFIG}
        className="aspect-[2/1] w-full"
        role="img"
        aria-label={`Clasificaciones ${periodLabel}`}
      >
        <BarChart data={rows}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={16}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="calls" fill="var(--color-calls)" radius={4} />
        </BarChart>
      </ChartContainer>
    </UsageChartCard>
  )
}

export function UsageTokensChart({
  rows,
  periodLabel,
  locale,
}: UsageChartProps) {
  return (
    <UsageChartCard
      title="Tokens"
      description="Entrada y salida enviadas al modelo."
      icon={CpuIcon}
    >
      <ChartContainer
        config={TOKENS_CONFIG}
        className="aspect-[2/1] w-full"
        role="img"
        aria-label={`Tokens de entrada y salida ${periodLabel}`}
      >
        <BarChart data={rows}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={16}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatUsageCount(value, locale)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatUsageCount(Number(value), locale)}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="inputTokens"
            stackId="tokens"
            fill="var(--color-inputTokens)"
          />
          <Bar
            dataKey="outputTokens"
            stackId="tokens"
            fill="var(--color-outputTokens)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </UsageChartCard>
  )
}

export function UsageCostChart({ rows, periodLabel, locale }: UsageChartProps) {
  return (
    <UsageChartCard
      title="Costo estimado"
      description="Lo que costó clasificar los correos, en USD."
      icon={CircleDollarSignIcon}
    >
      <ChartContainer
        config={COST_CONFIG}
        className="aspect-[2/1] w-full"
        role="img"
        aria-label={`Costo estimado ${periodLabel}`}
      >
        <LineChart data={rows}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={16}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) =>
              formatUsageCostAxis(value, locale)
            }
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatUsageCost(Number(value), locale)}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="costUsd"
            stroke="var(--color-costUsd)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </UsageChartCard>
  )
}

type UsageChartCardProps = {
  title: string
  description: string
  icon: typeof ChartColumnIcon
  children: ReactNode
}

function UsageChartCard({
  title,
  description,
  icon,
  children,
}: UsageChartCardProps) {
  return (
    <SummarySection title={title} subtitle={description} icon={icon}>
      {children}
    </SummarySection>
  )
}
