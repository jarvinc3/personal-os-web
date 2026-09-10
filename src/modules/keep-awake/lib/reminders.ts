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

function pad(value: number) {
  return String(value).padStart(2, "0")
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
  if (now.getHours() !== reminder.hour || now.getMinutes() !== reminder.minute) {
    return false
  }
  if (reminder.days.length > 0 && !reminder.days.includes(now.getDay())) {
    return false
  }
  return reminder.lastFiredKey !== reminderDateKey(now)
}

export function markReminderFired(
  reminder: KeepAwakeReminder,
  now: Date
): KeepAwakeReminder {
  return { ...reminder, lastFiredKey: reminderDateKey(now) }
}

export function formatReminderTime(reminder: KeepAwakeReminder): string {
  return `${pad(reminder.hour)}:${pad(reminder.minute)}`
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
