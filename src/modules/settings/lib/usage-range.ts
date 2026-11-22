import {
  fillDailyUsage,
  fillHourlyUsage,
  isUsageDays,
  type UsageDays,
} from "@/src/modules/intelligence"
import type {
  EmailUsageDay,
  EmailUsageHour,
  EmailUsageSummary,
} from "@/src/modules/intelligence/types/intelligence.types"

export type UsageChartSeries = {
  daily: EmailUsageDay[]
  hourly: EmailUsageHour[]
}

export function resolveUsageRangeDays(value: string): UsageDays | null {
  const days = Number(value)
  return isUsageDays(days) ? days : null
}

/**
 * Las series salen del par de fechas que manda el back; el cliente solo
 * rellena los días y las horas sin datos.
 */
type UsageChartSummary = Pick<EmailUsageSummary, "byDay" | "byHour" | "range">

export function resolveUsageChartSeries(
  summary: UsageChartSummary | undefined
): UsageChartSeries {
  if (!summary) {
    return { daily: [], hourly: [] }
  }
  return {
    daily: fillDailyUsage({
      byDay: summary.byDay,
      from: summary.range.from,
      to: summary.range.to,
    }),
    hourly: fillHourlyUsage(summary.byHour),
  }
}
