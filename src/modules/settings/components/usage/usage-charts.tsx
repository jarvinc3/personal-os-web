"use client"

import {
  formatUsageCost,
  formatUsageCostAxis,
  formatUsageCount,
  type EmailUsageDay,
  type EmailUsageHour,
} from "@/src/modules/intelligence"
import {
  CalendarDays,
  ChartColumnIcon,
  CircleDollarSignIcon,
  Clock3,
  CpuIcon,
} from "lucide-react"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { useTabsBehavior } from "@/src/shared/hooks/use-tabs-behavior"
import { formatDayMonth } from "@/src/shared/lib/date-format"
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

type UsagePeriod = "day" | "hour"

type UsageChartRow = {
  label: string
  calls: number
  inputTokens: number
  outputTokens: number
  costUsd: number
}

type UsageChartsProps = {
  daily: EmailUsageDay[]
  hourly: EmailUsageHour[]
  locale: string
}

export function UsageCharts({ daily, hourly, locale }: UsageChartsProps) {
  const tabsBehavior = useTabsBehavior({ defaultValue: "day" })
  const dailyRows = daily.map((bucket) => ({
    ...bucket,
    label: formatDayMonth(new Date(`${bucket.day}T00:00:00`), locale),
  }))
  const hourlyRows = hourly.map((bucket) => ({
    ...bucket,
    label: `${String(bucket.hour).padStart(2, "0")}:00`,
  }))

  return (
    <Tabs {...tabsBehavior} className="flex flex-col gap-3">
      <TabsList className="w-full rounded-2xl bg-muted">
        <TabsTrigger value="day" className="rounded-2xl py-3">
          <CalendarDays aria-hidden="true" /> Por día
        </TabsTrigger>
        <TabsTrigger value="hour" className="rounded-2xl py-3">
          <Clock3 aria-hidden="true" /> Por hora
        </TabsTrigger>
      </TabsList>
      <TabsContent value="day" className="flex flex-col gap-3">
        <UsagePeriodCharts rows={dailyRows} period="day" locale={locale} />
      </TabsContent>
      <TabsContent value="hour" className="flex flex-col gap-3">
        <UsagePeriodCharts rows={hourlyRows} period="hour" locale={locale} />
      </TabsContent>
    </Tabs>
  )
}

type UsagePeriodChartsProps = {
  rows: UsageChartRow[]
  period: UsagePeriod
  locale: string
}

function UsagePeriodCharts({ rows, period, locale }: UsagePeriodChartsProps) {
  const periodLabel = period === "day" ? "por día" : "por hora"

  return (
    <>
      <UsageDataTable rows={rows} period={period} locale={locale} />
      {period === "hour" ? (
        <p className="px-1 text-xs text-muted-foreground">
          Cada barra suma la misma hora (UTC) de todos los días del rango.
        </p>
      ) : null}
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

      <UsageChartCard
        title="Costo estimado"
        description="Costo registrado por el back, en USD."
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
    </>
  )
}

function UsageDataTable({ rows, period, locale }: UsagePeriodChartsProps) {
  const caption =
    period === "day"
      ? "Datos de uso por día"
      : "Datos de uso por hora del día (UTC)"

  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Período</th>
          <th scope="col">Llamadas</th>
          <th scope="col">Tokens de entrada</th>
          <th scope="col">Tokens de salida</th>
          <th scope="col">Costo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{formatUsageCount(row.calls, locale)}</td>
            <td>{formatUsageCount(row.inputTokens, locale)}</td>
            <td>{formatUsageCount(row.outputTokens, locale)}</td>
            <td>{formatUsageCost(row.costUsd, locale)}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
