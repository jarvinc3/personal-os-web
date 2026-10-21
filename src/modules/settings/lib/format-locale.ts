import { DEFAULT_LOCALE } from "./locale-options.ts"

/**
 * `Intl` throws on malformed tags, so anything outside the simple
 * language[-region] shape falls back to the product default.
 */
const SIMPLE_LOCALE_TAG = /^[a-z]{2,3}(-[a-z]{2}|-[0-9]{3})?$/i

export function normalizeFormatLocale(
  locale: string | null | undefined
): string {
  const candidate = (locale ?? DEFAULT_LOCALE).trim()
  if (!SIMPLE_LOCALE_TAG.test(candidate)) {
    return DEFAULT_LOCALE
  }
  return candidate
}
