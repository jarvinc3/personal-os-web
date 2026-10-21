import type { WeekStartsOn } from "@/src/modules/settings/types/profile.types"

import { DEFAULT_LOCALE } from "./locale-options.ts"

/** ICU `weekInfo.firstDay` numbers Monday as 1 and Sunday as 7. */
const ICU_FIRST_DAY_TO_WEEK_STARTS_ON: Record<
  number,
  WeekStartsOn | undefined
> = {
  1: 1,
  6: 6,
  7: 0,
}

const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 1

export const WEEK_STARTS_ON_OPTIONS: { value: WeekStartsOn; label: string }[] =
  [
    { value: 1, label: "Lunes" },
    { value: 0, label: "Domingo" },
    { value: 6, label: "Sábado" },
  ]

export function weekStartsOnLabel(value: WeekStartsOn): string {
  return (
    WEEK_STARTS_ON_OPTIONS.find((option) => option.value === value)?.label ??
    "Lunes"
  )
}

/**
 * The locale decides the first day when the profile stores `null`. Monday is
 * the answer only when the engine lacks `weekInfo`; a locale whose first day
 * cannot be stored is an unsupported value, not a missing one.
 */
export function weekStartsOnFromLocale(locale: string): WeekStartsOn {
  const parsedLocale = parseLocale(locale)
  const firstDay = readFirstDay(parsedLocale)

  if (firstDay === undefined) {
    return DEFAULT_WEEK_STARTS_ON
  }

  const weekStartsOn = ICU_FIRST_DAY_TO_WEEK_STARTS_ON[firstDay]
  if (weekStartsOn === undefined) {
    throw new Error(
      `Locale ${locale} starts the week on unsupported day ${firstDay}`
    )
  }
  return weekStartsOn
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
  if (input.stored !== null && input.stored !== undefined) {
    return input.stored
  }
  if (input.moduleFallback === 0 || input.moduleFallback === 1) {
    return input.moduleFallback
  }
  return weekStartsOnFromLocale(input.locale ?? DEFAULT_LOCALE)
}

function parseLocale(locale: string): Intl.Locale {
  try {
    return new Intl.Locale(locale)
  } catch (error) {
    throw new Error(`Invalid locale on the user profile: ${locale}`, {
      cause: error,
    })
  }
}

function readFirstDay(locale: Intl.Locale): number | undefined {
  const localeWithWeekInfo = locale as Intl.Locale & {
    weekInfo?: { firstDay: number }
    getWeekInfo?: () => { firstDay: number }
  }
  return (
    localeWithWeekInfo.weekInfo?.firstDay ??
    localeWithWeekInfo.getWeekInfo?.().firstDay
  )
}
