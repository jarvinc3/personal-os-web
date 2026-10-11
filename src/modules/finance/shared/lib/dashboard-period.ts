import { format, startOfMonth, startOfWeek, startOfYear } from "date-fns"

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

export const FINANCE_DASHBOARD_PERIOD_OPTIONS: {
  value: FinanceDashboardPeriod
  label: string
}[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
]
