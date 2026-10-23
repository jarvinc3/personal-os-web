import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"

/**
 * PROVISIONAL (#272): fixed money format so the gallery never reads the user
 * profile. Removed with the rest of `src/modules/card-gallery` in #290.
 */
export const GALLERY_DISPLAY: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

/** Fixed clock for the mock dates; the gallery must not depend on today. */
export const GALLERY_TODAY = new Date("2026-10-23T12:00:00.000Z")

export function galleryMoney(
  value: string,
  currency = GALLERY_DISPLAY.currency
): string {
  return formatFinanceMoney(value, { ...GALLERY_DISPLAY, currency })
}
