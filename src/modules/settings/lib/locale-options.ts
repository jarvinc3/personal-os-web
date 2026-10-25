import { DEFAULT_LOCALE } from "@/src/shared/constants/locales"

export { DEFAULT_LOCALE }

export const LOCALE_OPTIONS = [
  {
    value: "es-DO",
    label: "Español (República Dominicana)",
    description: "Textos y formatos para República Dominicana.",
  },
  {
    value: "es-ES",
    label: "Español (España)",
    description: "Textos y formatos para España.",
  },
  {
    value: "en-US",
    label: "English (United States)",
    description: "Textos y formatos para Estados Unidos.",
  },
] as const

export function localeLabel(locale: string | null | undefined): string {
  const match = LOCALE_OPTIONS.find((option) => option.value === locale)
  return match?.label ?? locale ?? LOCALE_OPTIONS[0].label
}
