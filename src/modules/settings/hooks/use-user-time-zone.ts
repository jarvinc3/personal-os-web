"use client"

import { useAppStore } from "@/src/shared/store/app-store"

/** The browser zone, used until the profile answers. */
export const DEVICE_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

/**
 * Zone the user reads and writes times in. The profile is the source of truth:
 * the device zone only covers the first render, before `/users/me` resolves.
 */
export function useUserTimeZone(): string {
  return useAppStore(
    (state) => state.user?.profile?.timezone || DEVICE_TIME_ZONE
  )
}
