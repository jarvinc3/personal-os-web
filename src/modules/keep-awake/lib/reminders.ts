import { formatTimeForDisplay } from "../../../shared/lib/date-format.ts"

export const KEEP_AWAKE_REMINDER_KEY = "keepawake_reminder" as const
export const REMINDER_CHANGED_EVENT = "keepawake-reminder-changed"

export type KeepAwakeReminder = {
  enabled: boolean
  hour: number
  minute: number
  days: number[]
  lastFiredKey: string | null
}

export const DEFAULT_REMINDER: KeepAwakeReminder = {
  enabled: false,
  hour: 9,
  minute: 0,
  days: [],
  lastFiredKey: null,
}

export const WEEKDAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"] as const
export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const
export const REMINDER_DUE_WINDOW_MS = 5 * 60_000
const MAX_REMINDER_ARM_MS = 60_000

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function toggleReminderDay(days: number[], day: number): number[] {
  const current =
    days.length === 0 || days.length === 7 ? [...ALL_WEEKDAYS] : [...days]
  const next = current.includes(day)
    ? current.filter((item) => item !== day)
    : [...current, day].sort((a, b) => a - b)
  if (next.length === 0 || next.length === 7) return []
  return next
}

export function reminderTimeFromDate(date: Date): Pick<KeepAwakeReminder, "hour" | "minute"> {
  return { hour: date.getHours(), minute: date.getMinutes() }
}

export function reminderDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function clampHour(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_REMINDER.hour
  return Math.min(23, Math.max(0, Math.floor(value)))
}

function clampMinute(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_REMINDER.minute
  return Math.min(59, Math.max(0, Math.floor(value)))
}

function parseDays(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return [
    ...new Set(
      value.filter(
        (day): day is number =>
          typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6
      )
    ),
  ].sort((a, b) => a - b)
}

export function parseReminder(raw: string | null): KeepAwakeReminder {
  if (!raw) return { ...DEFAULT_REMINDER }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_REMINDER }
    const data = parsed as Partial<KeepAwakeReminder>
    return {
      enabled: data.enabled === true,
      hour: clampHour(typeof data.hour === "number" ? data.hour : DEFAULT_REMINDER.hour),
      minute: clampMinute(
        typeof data.minute === "number" ? data.minute : DEFAULT_REMINDER.minute
      ),
      days: parseDays(data.days),
      lastFiredKey: typeof data.lastFiredKey === "string" ? data.lastFiredKey : null,
    }
  } catch {
    return { ...DEFAULT_REMINDER }
  }
}

export function serializeReminder(reminder: KeepAwakeReminder): string {
  return JSON.stringify(reminder)
}

export function isReminderDue(reminder: KeepAwakeReminder, now: Date): boolean {
  if (!reminder.enabled) return false
  if (reminder.days.length > 0 && !reminder.days.includes(now.getDay())) {
    return false
  }
  if (reminder.lastFiredKey === reminderDateKey(now)) return false
  const due = new Date(now)
  due.setHours(reminder.hour, reminder.minute, 0, 0)
  const elapsed = now.getTime() - due.getTime()
  return elapsed >= 0 && elapsed < REMINDER_DUE_WINDOW_MS
}

export function nextReminderDelayMs(reminder: KeepAwakeReminder, now: Date): number {
  if (!reminder.enabled) return MAX_REMINDER_ARM_MS
  if (isReminderDue(reminder, now)) return 250
  const due = new Date(now)
  due.setHours(reminder.hour, reminder.minute, 0, 0)
  const until = due.getTime() - now.getTime()
  if (until > 0) return Math.min(until, MAX_REMINDER_ARM_MS)
  return MAX_REMINDER_ARM_MS
}

export function markReminderFired(
  reminder: KeepAwakeReminder,
  now: Date
): KeepAwakeReminder {
  return { ...reminder, lastFiredKey: reminderDateKey(now) }
}

/** Canonical `HH:mm` (24 h) for wheels and storage. */
export function formatReminderTime(reminder: KeepAwakeReminder): string {
  return `${pad(reminder.hour)}:${pad(reminder.minute)}`
}

/** Clock label for UI (12 h). */
export function formatReminderTimeLabel(reminder: KeepAwakeReminder): string {
  return formatTimeForDisplay(formatReminderTime(reminder))
}

let reminderCacheRaw: string | null | undefined
let reminderCache: KeepAwakeReminder = DEFAULT_REMINDER

export function subscribeReminder(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key &&
      event.key !== KEEP_AWAKE_REMINDER_KEY
    ) {
      return
    }
    onChange()
  }
  window.addEventListener("storage", handler)
  window.addEventListener(REMINDER_CHANGED_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(REMINDER_CHANGED_EVENT, handler)
  }
}

export function getReminderSnapshot(): KeepAwakeReminder {
  if (typeof window === "undefined") return DEFAULT_REMINDER
  const raw = window.localStorage.getItem(KEEP_AWAKE_REMINDER_KEY)
  if (raw === reminderCacheRaw) return reminderCache
  reminderCacheRaw = raw
  reminderCache = parseReminder(raw)
  return reminderCache
}

export function writeReminder(reminder: KeepAwakeReminder) {
  window.localStorage.setItem(KEEP_AWAKE_REMINDER_KEY, serializeReminder(reminder))
  reminderCacheRaw = undefined
  window.dispatchEvent(new Event(REMINDER_CHANGED_EVENT))
}
