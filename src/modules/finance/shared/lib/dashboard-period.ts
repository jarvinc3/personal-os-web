import { format, startOfMonth, startOfWeek, startOfYear } from "date-fns"

import { isoMonthBounds } from "./month-window.ts"

export type FinanceDashboardPeriod = "week" | "month" | "year"

export type FinanceDashboardRange = {
  dateFrom: string
  dateTo: string
  granularity: "day" | "week" | "month"
}

function isoDate(value: Date): string {
  return format(value, "yyyy-MM-dd")
}

export function financeDashboardRange(
  period: FinanceDashboardPeriod,
  weekStartsOn: 0 | 1,
  now: Date = new Date()
): FinanceDashboardRange {
  const dateTo = isoDate(now)
  if (period === "week") {
    return {
      dateFrom: isoDate(startOfWeek(now, { weekStartsOn })),
      dateTo,
      granularity: "day",
    }
  }
  if (period === "month") {
    return {
      dateFrom: isoDate(startOfMonth(now)),
      dateTo,
      granularity: "day",
    }
  }
  return {
    dateFrom: isoDate(startOfYear(now)),
    dateTo,
    granularity: "month",
  }
}

/** Calendar month used by the home card, so it matches Movimientos. */
export function financeMonthSummaryRange(
  now: Date = new Date()
): FinanceDashboardRange {
  const { dateFrom, dateTo } = isoMonthBounds(
    now.getFullYear(),
    now.getMonth() + 1
  )
  return { dateFrom, dateTo, granularity: "day" }
}

export const FINANCE_DASHBOARD_PERIOD_OPTIONS: {
  value: FinanceDashboardPeriod
  label: string
}[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
]
