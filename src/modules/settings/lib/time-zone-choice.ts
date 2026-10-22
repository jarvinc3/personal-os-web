export const TIME_ZONE_CHOICE_STORAGE_KEY = "settings.timeZoneChosen"

function browserStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage
}

/** True once the zone was set by the user or by the first visit. */
export function readTimeZoneChoice(
  storage: Pick<Storage, "getItem"> | null = browserStorage()
): boolean {
  if (!storage) {
    return true
  }
  return storage.getItem(TIME_ZONE_CHOICE_STORAGE_KEY) !== null
}

export function writeTimeZoneChoice(
  timeZone: string,
  storage: Pick<Storage, "setItem"> | null = browserStorage()
): void {
  if (!storage) {
    return
  }
  storage.setItem(TIME_ZONE_CHOICE_STORAGE_KEY, timeZone)
}
