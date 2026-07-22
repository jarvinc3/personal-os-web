export function formatElapsed(totalSeconds: number): string {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const s = String(totalSeconds % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}

export function elapsedSecondsSince(startTimestamp: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - startTimestamp) / 1000))
}
