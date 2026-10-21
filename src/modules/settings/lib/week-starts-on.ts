import type { WeekStartsOn } from "@/src/modules/settings/types/profile.types"

import { DEFAULT_LOCALE } from "./locale-options.ts"

/**
 * ICU `weekInfo.firstDay` numbers Monday as 1 and Sunday as 7. Mid-week starts
 * (2-5) cannot be stored, so they fall back to Monday.
 */
const ICU_FIRST_DAY_TO_WEEK_STARTS_ON: Record<number, WeekStartsOn | undefined> =
  {
    1: 1,
    6: 6,
    7: 0,
  }

/** Last resort for engines without `Intl.Locale.weekInfo`. */
const WEEK_STARTS_ON_BY_LOCALE: Record<string, WeekStartsOn | undefined> = {
  "es-do": 0,
  "en-us": 0,
  "es-es": 1,
}

/**
 * `Intl.Locale` throws on malformed tags, so only the simple
 * language[-region] shape reaches it.
 */
const SIMPLE_LOCALE_TAG = /^[a-z]{2,3}(-[a-z]{2}|-[0-9]{3})?$/i

const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1

export const WEEK_STARTS_ON_OPTIONS: { value: WeekStartsOn; label: string }[] = [
  { value: 1, label: "Lunes" },
  { value: 0, label: "Domingo" },
  { value: 6, label: "Sábado" },
]

export function isWeekStartsOn(value: unknown): value is WeekStartsOn {
  return value === 0 || value === 1 || value === 6
}

export function weekStartsOnLabel(value: WeekStartsOn): string {
  return (
    WEEK_STARTS_ON_OPTIONS.find((option) => option.value === value)?.label ??
    "Lunes"
  )
}

export function weekStartsOnFromLocale(locale: string | null | undefined): WeekStartsOn {
  const normalizedLocale = (locale ?? DEFAULT_LOCALE).trim().toLowerCase()
  if (!SIMPLE_LOCALE_TAG.test(normalizedLocale)) {
    return WEEK_STARTS_ON_BY_LOCALE[normalizedLocale] ?? DEFAULT_WEEK_STARTS_ON
  }

  const icuFirstDay = readIcuFirstDay(normalizedLocale)
  if (icuFirstDay === undefined) {
    return WEEK_STARTS_ON_BY_LOCALE[normalizedLocale] ?? DEFAULT_WEEK_STARTS_ON
  }

  return ICU_FIRST_DAY_TO_WEEK_STARTS_ON[icuFirstDay] ?? DEFAULT_WEEK_STARTS_ON
}

/**
 * Stored choice first; `null` means the locale decides. Profiles saved before
 * the global preference existed fall back to the module value.
 */
export function resolveWeekStartsOn(input: {
  stored: WeekStartsOn | null | undefined
  locale: string | null | undefined
  moduleFallback?: 0 | 1 | null | undefined
}): WeekStartsOn {
  if (isWeekStartsOn(input.stored)) {
    return input.stored
  }
  if (input.moduleFallback === 0 || input.moduleFallback === 1) {
    return input.moduleFallback
  }
  return weekStartsOnFromLocale(input.locale)
}

function readIcuFirstDay(locale: string): number | undefined {
  const localeWithWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
    weekInfo?: { firstDay: number }
    getWeekInfo?: () => { firstDay: number }
  }

  return (
    localeWithWeekInfo.weekInfo?.firstDay ??
    localeWithWeekInfo.getWeekInfo?.().firstDay
  )
}
