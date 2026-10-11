export const KEEP_AWAKE_PREFS_KEY = "keepawake_prefs" as const
export const PREFS_CHANGED_EVENT = "keepawake-prefs-changed"
export const COUNTDOWN_PRESETS_MINUTES = [15, 25, 45, 60] as const
export const MIN_DURATION_MINUTES = 1
export const MAX_DURATION_MINUTES = 24 * 60

export type TimerMode = "open" | "countdown"

export type KeepAwakePrefs = {
  timerMode: TimerMode
  durationMinutes: number
}

export const DEFAULT_PREFS: KeepAwakePrefs = {
  timerMode: "open",
  durationMinutes: 25,
}

function clampDuration(minutes: number) {
  if (!Number.isFinite(minutes)) {
    return DEFAULT_PREFS.durationMinutes
  }
  return Math.min(
    MAX_DURATION_MINUTES,
    Math.max(MIN_DURATION_MINUTES, Math.floor(minutes))
  )
}

export function parsePrefs(raw: string | null): KeepAwakePrefs {
  if (!raw) {
    return { ...DEFAULT_PREFS }
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_PREFS }
    }
    const data = parsed as Partial<KeepAwakePrefs>
    return {
      timerMode: data.timerMode === "countdown" ? "countdown" : "open",
      durationMinutes: clampDuration(
        typeof data.durationMinutes === "number"
          ? data.durationMinutes
          : DEFAULT_PREFS.durationMinutes
      ),
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function serializePrefs(prefs: KeepAwakePrefs): string {
  return JSON.stringify({
    timerMode: prefs.timerMode,
    durationMinutes: clampDuration(prefs.durationMinutes),
  })
}

export function durationMsFromMinutes(minutes: number): number {
  return clampDuration(minutes) * 60_000
}

let prefsCacheRaw: string | null | undefined
let prefsCache: KeepAwakePrefs = DEFAULT_PREFS

export function subscribePrefs(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }
  const handler = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key &&
      event.key !== KEEP_AWAKE_PREFS_KEY
    ) {
      return
    }
    onChange()
  }
  window.addEventListener("storage", handler)
  window.addEventListener(PREFS_CHANGED_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(PREFS_CHANGED_EVENT, handler)
  }
}

export function getPrefsSnapshot(): KeepAwakePrefs {
  if (typeof window === "undefined") {
    return DEFAULT_PREFS
  }
  const raw = window.localStorage.getItem(KEEP_AWAKE_PREFS_KEY)
  if (raw === prefsCacheRaw) {
    return prefsCache
  }
  prefsCacheRaw = raw
  prefsCache = parsePrefs(raw)
  return prefsCache
}

export function writePrefs(prefs: KeepAwakePrefs) {
  const serialized = serializePrefs(prefs)
  window.localStorage.setItem(KEEP_AWAKE_PREFS_KEY, serialized)
  prefsCacheRaw = undefined
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT))
}

export function clearPrefs() {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(KEEP_AWAKE_PREFS_KEY)
  prefsCacheRaw = undefined
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT))
}
