import { addMonths, format, startOfMonth } from "date-fns"

export const FINANCE_TIMELINE_INITIAL_MONTH_RADIUS = 12
export const FINANCE_TIMELINE_EXTEND_MONTHS = 12
export const FINANCE_TIMELINE_EXTEND_WHEN_WITHIN = 2

export type YearMonth = { year: number; month: number }
export type MonthKey = string

export function monthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function parseMonthKey(key: MonthKey): YearMonth {
  const year = Number(key.slice(0, 4))
  const month = Number(key.slice(5, 7))
  return { year, month }
}

export function monthKeyFromDate(date: Date): MonthKey {
  return monthKey(date.getFullYear(), date.getMonth() + 1)
}

export function initialMonthRange(now: Date = new Date()): {
  from: Date
  to: Date
} {
  const current = startOfMonth(now)
  return {
    from: addMonths(current, -FINANCE_TIMELINE_INITIAL_MONTH_RADIUS),
    to: nextMonthStart(now),
  }
}

function nextMonthStart(now: Date): Date {
  return addMonths(startOfMonth(now), 1)
}

export function listYearMonths(from: Date, to: Date): YearMonth[] {
  const start = startOfMonth(from)
  const end = startOfMonth(to)
  const months: YearMonth[] = []
  let cursor = start
  while (cursor.getTime() <= end.getTime()) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 })
    cursor = addMonths(cursor, 1)
  }
  return months
}

function monthsBetween(from: Date, to: Date): number {
  const start = startOfMonth(from)
  const end = startOfMonth(to)
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  )
}

export function extendMonthRange({
  range,
  active,
  now,
}: {
  range: { from: Date; to: Date }
  active: Date
  now: Date
}): { from: Date; to: Date } {
  const from = startOfMonth(range.from)
  const to = startOfMonth(range.to)
  const activeMonth = startOfMonth(active)
  let nextFrom = from
  let nextTo = to
  if (monthsBetween(from, activeMonth) <= FINANCE_TIMELINE_EXTEND_WHEN_WITHIN) {
    nextFrom = addMonths(activeMonth, -FINANCE_TIMELINE_EXTEND_MONTHS)
  }
  if (monthsBetween(activeMonth, to) <= FINANCE_TIMELINE_EXTEND_WHEN_WITHIN) {
    const wanted = addMonths(activeMonth, FINANCE_TIMELINE_EXTEND_MONTHS)
    const cap = nextMonthStart(now)
    const capped = wanted.getTime() > cap.getTime() ? cap : wanted
    nextTo = capped.getTime() < to.getTime() ? to : capped
  }
  return { from: nextFrom, to: nextTo }
}

export function yearsTouched(from: Date, to: Date): number[] {
  const startYear = from.getFullYear()
  const endYear = to.getFullYear()
  const years: number[] = []
  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year)
  }
  return years
}

export function isoMonthBounds(
  year: number,
  month: number
): { dateFrom: string; dateTo: string } {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  return {
    dateFrom: format(start, "yyyy-MM-dd"),
    dateTo: format(end, "yyyy-MM-dd"),
  }
}

/** The `months` full calendar months before the current one. */
export function previousMonthsBounds(
  now: Date,
  months: number
): { dateFrom: string; dateTo: string } {
  const start = new Date(now.getFullYear(), now.getMonth() - months, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0)
  return {
    dateFrom: format(start, "yyyy-MM-dd"),
    dateTo: format(end, "yyyy-MM-dd"),
  }
}

export function intersectIsoDateRange(
  windowFrom: string,
  windowTo: string,
  filterFrom?: string,
  filterTo?: string
): { dateFrom: string; dateTo: string } | null {
  const dateFrom =
    filterFrom && filterFrom > windowFrom ? filterFrom : windowFrom
  const dateTo = filterTo && filterTo < windowTo ? filterTo : windowTo
  if (dateFrom > dateTo) {
    return null
  }
  return { dateFrom, dateTo }
}
