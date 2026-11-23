"use client"

import {
  formatUsageCost,
  formatUsageCount,
  type EmailUsageDay,
  type EmailUsageHour,
} from "@/src/modules/intelligence"
import {
  UsageCallsChart,
  UsageCostChart,
  UsageTokensChart,
  type UsageChartRow,
} from "@/src/modules/settings/components/usage/usage-chart-cards"
import { CalendarDays, Clock3 } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { useTabsBehavior } from "@/src/shared/hooks/use-tabs-behavior"
import { formatDayMonth } from "@/src/shared/lib/date-format"

type UsagePeriod = "day" | "hour"

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
      <UsageCallsChart rows={rows} periodLabel={periodLabel} />
      <UsageTokensChart rows={rows} periodLabel={periodLabel} locale={locale} />
      <UsageCostChart rows={rows} periodLabel={periodLabel} locale={locale} />
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
