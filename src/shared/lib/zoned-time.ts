const WALL_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

const pad = (value: number): string => String(value).padStart(2, "0")

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

/** Parts an instant shows in one zone, using the h23 clock (`00`–`23`). */
function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant)
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value
    const parsed = Number(value)
    if (!value || !Number.isFinite(parsed)) {
      throw new Error(`The zone formatter returned no ${type} for ${timeZone}`)
    }
    return parsed
  }
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  }
}

/** Minutes the zone is ahead of UTC at that instant. */
function zoneOffsetMinutes(instantMs: number, timeZone: string): number {
  const parts = zonedParts(new Date(instantMs), timeZone)
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute
  )
  return (asUtc - instantMs) / 60_000
}

/**
 * The instant a wall clock names in that zone. Resolved twice because the
 * offset of the first guess can fall on the other side of a DST change.
 */
export function zonedWallTimeToInstant(wall: string, timeZone: string): string {
  const match = WALL_TIME.exec(wall.trim())
  if (!match) {
    throw new Error(`Expected YYYY-MM-DDTHH:mm, got "${wall}"`)
  }
  const [, year, month, day, hour, minute] = match
  const naiveUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  )
  const firstGuess = naiveUtc - zoneOffsetMinutes(naiveUtc, timeZone) * 60_000
  const settled = naiveUtc - zoneOffsetMinutes(firstGuess, timeZone) * 60_000
  return new Date(settled).toISOString()
}

/** Wall clock in the user's zone, ready for the slicing formatters. */
export function instantToZonedWallTime(iso: string, timeZone: string): string {
  const instant = new Date(iso)
  if (Number.isNaN(instant.getTime())) {
    return iso
  }
  const parts = zonedParts(instant, timeZone)
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`
}

export function instantToZonedDate(iso: string, timeZone: string): string {
  const instant = new Date(iso)
  if (Number.isNaN(instant.getTime())) {
    return iso
  }
  const parts = zonedParts(instant, timeZone)
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

/** First instant of the first day of a month, in the user's zone. */
export function zonedMonthStart(
  year: number,
  month: number,
  timeZone: string
): string {
  return zonedWallTimeToInstant(`${year}-${pad(month)}-01T00:00`, timeZone)
}

/** Last instant of the last day of a month, in the user's zone. */
export function zonedMonthEnd(
  year: number,
  month: number,
  timeZone: string
): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return zonedWallTimeToInstant(
    `${year}-${pad(month)}-${pad(lastDay)}T23:59`,
    timeZone
  )
}
