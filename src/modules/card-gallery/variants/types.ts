import type { ReactNode } from "react"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"

export type GalleryRenderContext = {
  display: FinanceMoneyDisplay
  notifyTap: () => void
}

/** Una fila de la pantalla de una entidad (#272). */
export type GalleryVariant = {
  id: string
  label: string
  propLabel: string
  height: string
  isDraft?: boolean
  render: (context: GalleryRenderContext) => ReactNode
}
