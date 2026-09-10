export function formatElapsed(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0
  const h = String(Math.floor(safe / 3600)).padStart(2, "0")
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, "0")
  const s = String(safe % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}

export function elapsedSecondsSince(startTimestamp: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - startTimestamp) / 1000))
}

export function remainingSecondsUntil(endsAt: number, now = Date.now()): number {
  return Math.max(0, Math.floor((endsAt - now) / 1000))
}

export function sessionElapsedSeconds(
  input: {
    startTimestamp: number | null
    userPaused: boolean
    pauseStartedAt: number | null
    accumulatedPauseMs: number
  },
  now = Date.now()
): number {
  if (input.startTimestamp == null) return 0
  let pauseMs = input.accumulatedPauseMs
  if (input.userPaused && input.pauseStartedAt != null) {
    pauseMs += Math.max(0, now - input.pauseStartedAt)
  }
  return Math.max(0, Math.floor((now - input.startTimestamp - pauseMs) / 1000))
}

export function sessionRemainingSeconds(
  input: {
    endsAt: number | null
    userPaused: boolean
    pauseStartedAt: number | null
  },
  now = Date.now()
): number {
  if (input.endsAt == null) return 0
  const clock =
    input.userPaused && input.pauseStartedAt != null ? input.pauseStartedAt : now
  return remainingSecondsUntil(input.endsAt, clock)
}
