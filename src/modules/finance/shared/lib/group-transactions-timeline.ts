import { format } from "date-fns"

import {
  formatDayHeaderLabel,
  formatMonthYearLabel,
} from "@/src/shared/lib/date-format"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import type { WeekStartsOn } from "@/src/modules/settings/types/profile.types"
import {
  groupReversals,
  type ReversalGroup,
} from "@/src/modules/finance/transactions/lib/group-reversals"
import { weeksForMonth, type CalendarWeek } from "./calendar-weeks.ts"
import { monthBannerSrc } from "./month-banners.ts"
import { monthKey, type MonthKey, type YearMonth } from "./month-window.ts"
import { visibleTransactionTotals } from "./transactions-query.ts"

export type TimelineDay = {
  dateKey: string
  label: string
  net: number
  items: FinanceTransaction[]
  /** Rendered rows: one per reversal pair, one per loose movement. */
  rows: ReversalGroup[]
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

function monthKeyFromTransaction(item: FinanceTransaction): MonthKey | null {
  const date = calendarDateFromTransaction(item.transactionDate)
  if (!date) {
    return null
  }
  return monthKey(date.getFullYear(), date.getMonth() + 1)
}

function groupItems(group: ReversalGroup): FinanceTransaction[] {
  if (!group.reversal) {
    return [group.original]
  }
  return [group.original, group.reversal]
}

function groupsByMonth(
  groups: readonly ReversalGroup[]
): Map<MonthKey, ReversalGroup[]> {
  const byMonth = new Map<MonthKey, ReversalGroup[]>()
  for (const group of groups) {
    const key = monthKeyFromTransaction(group.original)
    if (!key) {
      continue
    }
    const bucket = byMonth.get(key)
    if (bucket) {
      bucket.push(group)
      continue
    }
    byMonth.set(key, [group])
  }
  return byMonth
}

function groupsByDayKey(
  groups: readonly ReversalGroup[]
): Map<string, ReversalGroup[]> {
  const byDay = new Map<string, ReversalGroup[]>()
  for (const group of groups) {
    const date = calendarDateFromTransaction(group.original.transactionDate)
    if (!date) {
      continue
    }
    const key = dateKey(date)
    const bucket = byDay.get(key)
    if (bucket) {
      bucket.push(group)
      continue
    }
    byDay.set(key, [group])
  }
  return byDay
}

export function buildTimelineMonths(input: {
  months: YearMonth[]
  items: FinanceTransaction[]
  weekStartsOn: WeekStartsOn
  locale: string
}): TimelineMonth[] {
  const { months, items, weekStartsOn, locale } = input
  const renderedMonthKeys = new Set(
    months.map((slot) => monthKey(slot.year, slot.month))
  )
  const byMonth = groupsByMonth(
    groupReversals(
      items.filter((item) => {
        const key = monthKeyFromTransaction(item)
        return key !== null && renderedMonthKeys.has(key)
      })
    )
  )

  return months.map((slot) => {
    const key = monthKey(slot.year, slot.month)
    const monthGroups = (byMonth.get(key) ?? [])
      .slice()
      .sort((left, right) => compareTransactions(left.original, right.original))
    const monthItems = monthGroups.flatMap(groupItems)
    const weeks = weeksForMonth({
      year: slot.year,
      month: slot.month,
      weekStartsOn,
    }).map((week) => {
      const weekGroups = monthGroups.filter((group) => {
        const date = calendarDateFromTransaction(group.original.transactionDate)
        return date ? inClippedWeek(date, week) : false
      })
      const days: TimelineDay[] = [...groupsByDayKey(weekGroups).entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([dayKey, dayGroups]) => {
          const date = calendarDateFromTransaction(dayKey)!
          const dayItems = dayGroups.flatMap(groupItems)
          const totals = visibleTransactionTotals(dayItems)
          return {
            dateKey: dayKey,
            label: formatDayHeaderLabel(date, locale),
            net: totals.income - totals.expenses,
            items: dayItems,
            rows: dayGroups,
          }
        })
      return { ...week, days }
    })
    const monthDate = new Date(slot.year, slot.month - 1, 1)
    return {
      key,
      year: slot.year,
      month: slot.month,
      label: formatMonthYearLabel(monthDate, locale),
      bannerSrc: monthBannerSrc(slot.month),
      totals: visibleTransactionTotals(monthItems),
      weeks,
    }
  })
}
