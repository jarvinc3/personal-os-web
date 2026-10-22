import { addDays, endOfWeek, startOfWeek } from "date-fns"

import type { WeekStartsOn } from "@/src/modules/settings/types/profile.types"

export type CalendarWeek = {
  id: string
  start: Date
  end: Date
  label: string
}

const WEEKDAY_SHORT = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const

function shortWeekday(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()] ?? "dom"
}

function atLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatClippedWeekLabel(start: Date, end: Date): string {
  return `${shortWeekday(start)} ${start.getDate()} - ${shortWeekday(end)} ${end.getDate()}`
}

export function weeksForMonth(input: {
  year: number
  month: number
  weekStartsOn: WeekStartsOn
}): CalendarWeek[] {
  const monthStart = new Date(input.year, input.month - 1, 1)
  const monthEnd = new Date(input.year, input.month, 0)
  const weeks: CalendarWeek[] = []
  let cursor = startOfWeek(monthStart, {
    weekStartsOn: input.weekStartsOn,
  })
  let index = 0

  while (cursor.getTime() <= monthEnd.getTime()) {
    const rawEnd = endOfWeek(cursor, {
      weekStartsOn: input.weekStartsOn,
    })
    const start =
      cursor.getTime() < monthStart.getTime()
        ? monthStart
        : atLocalMidnight(cursor)
    const end =
      rawEnd.getTime() > monthEnd.getTime() ? monthEnd : atLocalMidnight(rawEnd)
    index += 1
    weeks.push({
      id: `${input.year}-${String(input.month).padStart(2, "0")}-w${index}`,
      start,
      end,
      label: formatClippedWeekLabel(start, end),
    })
    cursor = addDays(cursor, 7)
  }

  return weeks
}
