import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"

/** Formato de dinero fijo: la galería no lee el perfil del usuario. */
export const GALLERY_DISPLAY: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

export const GALLERY_COMPACT_DISPLAY: FinanceMoneyDisplay = {
  ...GALLERY_DISPLAY,
  compactNumbers: true,
}

export const GALLERY_NO_CENTS_DISPLAY: FinanceMoneyDisplay = {
  ...GALLERY_DISPLAY,
  showCents: false,
}

/** Fechas fijas: la galería no depende del día en que se abre. */
export const GALLERY_DATE = "2026-10-23"
export const GALLERY_DATE_TIME = "2026-10-23T09:30"
export const GALLERY_TIME = "09:30"

/** Montos de ejemplo, siempre en el formato string del API. */
export const GALLERY_AMOUNTS = {
  expense: "-1850.00",
  income: "12500.00",
  zero: "0.00",
  large: "1250000.00",
} as const

/** Colores de módulo usados como acento en los controles de ejemplo. */
export const GALLERY_ACCENT = "#0f766e"
