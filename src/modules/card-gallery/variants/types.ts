import type { ReactNode } from "react"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"

export type GalleryRenderContext = {
  display: FinanceMoneyDisplay
  notifyTap: () => void
}

/**
 * PROVISIONAL (#272): one row of an entity screen. Delete with the gallery in
 * #290.
 */
export type GalleryVariant = {
  id: string
  label: string
  propLabel: string
  height: string
  provisional?: boolean
  render: (context: GalleryRenderContext) => ReactNode
}
