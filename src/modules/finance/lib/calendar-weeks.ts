import { addDays, endOfWeek, startOfWeek } from "date-fns"

export const FINANCE_CALENDAR_WEEK_STARTS_ON = 0 as const

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

export function weeksForMonth(year: number, month: number): CalendarWeek[] {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)
  const weeks: CalendarWeek[] = []
  let cursor = startOfWeek(monthStart, {
    weekStartsOn: FINANCE_CALENDAR_WEEK_STARTS_ON,
  })
  let index = 0

  while (cursor.getTime() <= monthEnd.getTime()) {
    const rawEnd = endOfWeek(cursor, {
      weekStartsOn: FINANCE_CALENDAR_WEEK_STARTS_ON,
    })
    const start =
      cursor.getTime() < monthStart.getTime() ? monthStart : atLocalMidnight(cursor)
    const end =
      rawEnd.getTime() > monthEnd.getTime() ? monthEnd : atLocalMidnight(rawEnd)
    index += 1
    weeks.push({
      id: `${year}-${String(month).padStart(2, "0")}-w${index}`,
      start,
      end,
      label: formatClippedWeekLabel(start, end),
    })
    cursor = addDays(cursor, 7)
  }

  return weeks
}
