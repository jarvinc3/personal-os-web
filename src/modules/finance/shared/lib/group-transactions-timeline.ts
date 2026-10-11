import { format } from "date-fns"

import {
  formatDayHeaderLabel,
  formatMonthYearLabel,
} from "@/src/shared/lib/date-format"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { weeksForMonth, type CalendarWeek } from "./calendar-weeks.ts"
import { monthBannerSrc } from "./month-banners.ts"
import { monthKey, type MonthKey, type YearMonth } from "./month-window.ts"
import { visibleTransactionTotals } from "./transactions-query.ts"

export type TimelineDay = {
  dateKey: string
  label: string
  net: number
  items: FinanceTransaction[]
}

export type TimelineWeek = CalendarWeek & { days: TimelineDay[] }

export type TimelineMonth = {
  key: MonthKey
  year: number
  month: number
  label: string
  bannerSrc: string
  totals: { income: number; expenses: number }
  weeks: TimelineWeek[]
}

export function calendarDateFromTransaction(value: string): Date | null {
  const slice = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) {
    return null
  }
  const year = Number(slice.slice(0, 4))
  const month = Number(slice.slice(5, 7))
  const day = Number(slice.slice(8, 10))
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

function compareTransactions(
  left: FinanceTransaction,
  right: FinanceTransaction
): number {
  return (
    left.transactionDate.localeCompare(right.transactionDate) ||
    left.id.localeCompare(right.id)
  )
}

function inClippedWeek(date: Date, week: CalendarWeek): boolean {
  const time = date.getTime()
  return time >= week.start.getTime() && time <= week.end.getTime()
}

export function buildTimelineMonths(
  months: YearMonth[],
  items: FinanceTransaction[]
): TimelineMonth[] {
  const byMonth = new Map<MonthKey, FinanceTransaction[]>()
  for (const item of items) {
    const date = calendarDateFromTransaction(item.transactionDate)
    if (!date) {
      continue
    }
    const key = monthKey(date.getFullYear(), date.getMonth() + 1)
    const bucket = byMonth.get(key)
    if (bucket) {
      bucket.push(item)
    } else {
      byMonth.set(key, [item])
    }
  }

  return months.map((slot) => {
    const key = monthKey(slot.year, slot.month)
    const monthItems = (byMonth.get(key) ?? [])
      .slice()
      .sort(compareTransactions)
    const weeks = weeksForMonth(slot.year, slot.month).map((week) => {
      const weekItems = monthItems.filter((item) => {
        const date = calendarDateFromTransaction(item.transactionDate)
        return date ? inClippedWeek(date, week) : false
      })
      const byDay = new Map<string, FinanceTransaction[]>()
      for (const item of weekItems) {
        const date = calendarDateFromTransaction(item.transactionDate)
        if (!date) {
          continue
        }
        const dayKey = dateKey(date)
        const dayItems = byDay.get(dayKey)
        if (dayItems) {
          dayItems.push(item)
        } else {
          byDay.set(dayKey, [item])
        }
      }
      const days: TimelineDay[] = [...byDay.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([dayKey, dayItems]) => {
          const date = calendarDateFromTransaction(dayKey)!
          const totals = visibleTransactionTotals(dayItems)
          return {
            dateKey: dayKey,
            label: formatDayHeaderLabel(date),
            net: totals.income - totals.expenses,
            items: dayItems,
          }
        })
      return { ...week, days }
    })
    const monthDate = new Date(slot.year, slot.month - 1, 1)
    return {
      key,
      year: slot.year,
      month: slot.month,
      label: formatMonthYearLabel(monthDate),
      bannerSrc: monthBannerSrc(slot.month),
      totals: visibleTransactionTotals(monthItems),
      weeks,
    }
  })
}
