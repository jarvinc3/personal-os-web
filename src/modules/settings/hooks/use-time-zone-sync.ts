"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { DEVICE_TIME_ZONE } from "@/src/modules/settings/hooks/use-user-time-zone"
import {
  readTimeZoneChoice,
  writeTimeZoneChoice,
} from "@/src/modules/settings/lib/time-zone-choice"
import { useEffect, useRef } from "react"

/**
 * Stores the browser zone the first time the account is seen, so a new user
 * reads times in their own zone without opening settings. A zone the user
 * picked is never overwritten.
 */
export function useTimeZoneSync() {
  const { profileQuery, updateProfileMutation } = useProfile()
  const handled = useRef(false)
  const profileZone = profileQuery.data?.timezone ?? null

  useEffect(() => {
    if (handled.current || profileZone === null) {
      return
    }
    handled.current = true
    if (readTimeZoneChoice()) {
      return
    }
    if (profileZone === DEVICE_TIME_ZONE) {
      writeTimeZoneChoice(DEVICE_TIME_ZONE)
      return
    }
    updateProfileMutation.mutate(
      { timezone: DEVICE_TIME_ZONE },
      { onSuccess: () => writeTimeZoneChoice(DEVICE_TIME_ZONE) }
    )
  }, [profileZone, updateProfileMutation])
}
