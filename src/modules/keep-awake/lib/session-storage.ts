export const KEEP_AWAKE_STORAGE_KEY = "keepawake_start_ts" as const
export const KEEP_AWAKE_CHANNEL_NAME = "personal-os-keep-awake" as const
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000
export const SESSION_FUTURE_SKEW_MS = 60_000

export type KeepAwakeSessionRecord = {
  startTimestamp: number
  ownerId: string
  endsAt: number | null
  userPaused: boolean
  pauseStartedAt: number | null
  accumulatedPauseMs: number
}

export type SessionStorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export function isValidStartTimestamp(timestamp: number, now = Date.now()): boolean {
  if (!Number.isFinite(timestamp)) return false
  if (timestamp > now + SESSION_FUTURE_SKEW_MS) return false
  if (now - timestamp > SESSION_MAX_AGE_MS) return false
  return true
}

export function serializeSessionRecord(record: KeepAwakeSessionRecord): string {
  return JSON.stringify({
    startTimestamp: record.startTimestamp,
    ownerId: record.ownerId,
    endsAt: record.endsAt,
    userPaused: record.userPaused,
    pauseStartedAt: record.pauseStartedAt,
    accumulatedPauseMs: record.accumulatedPauseMs,
  })
}

function parseEndsAt(value: unknown): number | null {
  if (value == null) return null
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return value
}

function parsePauseStartedAt(value: unknown): number | null {
  if (value == null) return null
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return value
}

function parseAccumulatedPauseMs(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0
  return value
}

function idlePauseFields() {
  return {
    userPaused: false,
    pauseStartedAt: null as number | null,
    accumulatedPauseMs: 0,
  }
}

export function parseSessionRecord(
  raw: string | null,
  now = Date.now()
): KeepAwakeSessionRecord | null {
  if (!raw) return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  const fromLegacy = Number(trimmed)
  if (trimmed !== "" && Number.isFinite(fromLegacy) && !trimmed.startsWith("{")) {
    if (!isValidStartTimestamp(fromLegacy, now)) return null
    return { startTimestamp: fromLegacy, ownerId: "", endsAt: null, ...idlePauseFields() }
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (!parsed || typeof parsed !== "object") return null
    const startTimestamp = (parsed as { startTimestamp?: unknown }).startTimestamp
    const ownerId = (parsed as { ownerId?: unknown }).ownerId
    if (typeof startTimestamp !== "number" || !Number.isFinite(startTimestamp)) {
      return null
    }
    if (!isValidStartTimestamp(startTimestamp, now)) return null
    return {
      startTimestamp,
      ownerId: typeof ownerId === "string" ? ownerId : "",
      endsAt: parseEndsAt((parsed as { endsAt?: unknown }).endsAt),
      userPaused: (parsed as { userPaused?: unknown }).userPaused === true,
      pauseStartedAt: parsePauseStartedAt(
        (parsed as { pauseStartedAt?: unknown }).pauseStartedAt
      ),
      accumulatedPauseMs: parseAccumulatedPauseMs(
        (parsed as { accumulatedPauseMs?: unknown }).accumulatedPauseMs
      ),
    }
  } catch {
    return null
  }
}

export function writeSessionRecord(
  storage: SessionStorageLike,
  record: KeepAwakeSessionRecord
): void {
  storage.setItem(KEEP_AWAKE_STORAGE_KEY, serializeSessionRecord(record))
}

export function clearSessionRecord(storage: SessionStorageLike): void {
  storage.removeItem(KEEP_AWAKE_STORAGE_KEY)
}

export function readSessionRecord(
  storage: SessionStorageLike,
  now = Date.now()
): KeepAwakeSessionRecord | null {
  const raw = storage.getItem(KEEP_AWAKE_STORAGE_KEY)
  const record = parseSessionRecord(raw, now)
  if (!record && raw) {
    storage.removeItem(KEEP_AWAKE_STORAGE_KEY)
  }
  return record
}

export type KeepAwakeChannelMessage =
  | { type: "claim"; ownerId: string; startTimestamp: number }
  | { type: "stop"; ownerId: string }

export function parseChannelMessage(data: unknown): KeepAwakeChannelMessage | null {
  if (!data || typeof data !== "object") return null
  const type = (data as { type?: unknown }).type
  const ownerId = (data as { ownerId?: unknown }).ownerId
  if (typeof ownerId !== "string" || ownerId.length === 0) return null

  if (type === "stop") {
    return { type: "stop", ownerId }
  }

  if (type === "claim") {
    const startTimestamp = (data as { startTimestamp?: unknown }).startTimestamp
    if (typeof startTimestamp !== "number" || !Number.isFinite(startTimestamp)) {
      return null
    }
    return { type: "claim", ownerId, startTimestamp }
  }

  return null
}
