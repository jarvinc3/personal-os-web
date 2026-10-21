"use client"

import { normalizeFormatLocale } from "@/src/modules/settings/lib/format-locale"

import { useProfile } from "./use-profile"

/** Locale that drives date and number formatting across the app. */
export function useFormatLocale(): string {
  const { profileQuery } = useProfile()
  return normalizeFormatLocale(profileQuery.data?.locale)
}
