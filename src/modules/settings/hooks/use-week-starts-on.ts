"use client"

import { resolveWeekStartsOn } from "@/src/modules/settings/lib/week-starts-on"

import type { WeekStartsOn } from "@/src/modules/settings/types/profile.types"
import { useProfile } from "./use-profile"

/**
 * `moduleFallback` keeps profiles saved before the global preference working
 * until the module values are cleaned up.
 */
export function useWeekStartsOn(
  moduleFallback?: 0 | 1 | null
): WeekStartsOn {
  const { profileQuery, preferences } = useProfile()

  return resolveWeekStartsOn({
    stored: preferences.regional.weekStartsOn,
    locale: profileQuery.data?.locale,
    moduleFallback,
  })
}
