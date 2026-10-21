"use client"

import { DEFAULT_LOCALE } from "@/src/modules/settings/lib/locale-options"

import { useProfile } from "./use-profile"

/** Locale that drives date and number formatting across the app. */
export function useFormatLocale(): string {
  const { profileQuery } = useProfile()
  return profileQuery.data?.locale ?? DEFAULT_LOCALE
}
