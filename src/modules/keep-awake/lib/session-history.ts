export const KEEP_AWAKE_HISTORY_KEY = "keepawake_history" as const
export const HISTORY_MAX_ITEMS = 50
export const HISTORY_CHANGED_EVENT = "keepawake-history-changed"

const EMPTY_HISTORY: KeepAwakeHistoryEntry[] = []
let historyCacheRaw: string | null | undefined
let historyCache: KeepAwakeHistoryEntry[] = EMPTY_HISTORY

export type SessionEndReason =
  | "paused"
  | "ended"
  | "countdown_finished"
  | "tab_yielded"
  | "layout_unmounted"

export type KeepAwakeHistoryEntry = {
  id: string
  startedAt: number
  endedAt: number
  durationSeconds: number
  endReason: SessionEndReason
}

type SessionStorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const END_REASONS = new Set<SessionEndReason>([
  "paused",
  "ended",
  "countdown_finished",
  "tab_yielded",
  "layout_unmounted",
])

function isHistoryEntry(value: unknown): value is KeepAwakeHistoryEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as KeepAwakeHistoryEntry
  return (
    typeof entry.id === "string" &&
    typeof entry.startedAt === "number" &&
    Number.isFinite(entry.startedAt) &&
    typeof entry.endedAt === "number" &&
    Number.isFinite(entry.endedAt) &&
    typeof entry.durationSeconds === "number" &&
    Number.isFinite(entry.durationSeconds) &&
    END_REASONS.has(entry.endReason)
  )
}

export function readHistory(storage: SessionStorageLike): KeepAwakeHistoryEntry[] {
  const raw = storage.getItem(KEEP_AWAKE_HISTORY_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_MAX_ITEMS)
  } catch {
    return []
  }
}

export function appendHistoryEntry(
  storage: SessionStorageLike,
  input: {
    startedAt: number
    endedAt: number
    endReason: SessionEndReason
    durationSeconds?: number
  },
  id = createHistoryId()
): KeepAwakeHistoryEntry {
  const durationSeconds =
    typeof input.durationSeconds === "number" && Number.isFinite(input.durationSeconds)
      ? Math.max(0, Math.floor(input.durationSeconds))
      : Math.max(0, Math.floor((input.endedAt - input.startedAt) / 1000))
  const entry: KeepAwakeHistoryEntry = {
    id,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationSeconds,
    endReason: input.endReason,
  }
  if (durationSeconds <= 0) {
    return entry
  }

  const next = [entry, ...readHistory(storage).filter((item) => item.id !== id)].slice(
    0,
    HISTORY_MAX_ITEMS
  )
  storage.setItem(KEEP_AWAKE_HISTORY_KEY, JSON.stringify(next))
  historyCacheRaw = undefined
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HISTORY_CHANGED_EVENT))
  }
  return entry
}

export function historyEndReasonLabel(reason: SessionEndReason): string {
  switch (reason) {
    case "countdown_finished":
      return "Temporizador"
    case "tab_yielded":
      return "Otra pestaña"
    case "layout_unmounted":
      return "Cierre"
    case "ended":
      return "Terminada"
    default:
      return "Pausada"
  }
}

function createHistoryId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function subscribeHistory(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key &&
      event.key !== KEEP_AWAKE_HISTORY_KEY
    ) {
      return
    }
    onChange()
  }
  window.addEventListener("storage", handler)
  window.addEventListener(HISTORY_CHANGED_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(HISTORY_CHANGED_EVENT, handler)
  }
}

export function getHistorySnapshot(): KeepAwakeHistoryEntry[] {
  if (typeof window === "undefined") return EMPTY_HISTORY
  const raw = window.localStorage.getItem(KEEP_AWAKE_HISTORY_KEY)
  if (raw === historyCacheRaw) return historyCache
  historyCacheRaw = raw
  historyCache = readHistory(window.localStorage)
  return historyCache
}

export function getServerHistorySnapshot(): KeepAwakeHistoryEntry[] {
  return EMPTY_HISTORY
}
