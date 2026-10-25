"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { useGalleryTap } from "@/src/modules/card-gallery/gallery-tap"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"
import { Badge } from "@/src/shared/components/ui/badge"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { BoxIcon } from "lucide-react"

/** Etiqueta y card real de una variante (#272). */
export function GalleryVariantRow({
  variant,
  display,
}: {
  variant: GalleryVariant
  display: FinanceMoneyDisplay
}) {
  const { notifyTap } = useGalleryTap()

  return (
    <SummarySection
      title={variant.label}
      subtitle={`${variant.propLabel}${variant.isDraft ? " · Borrador" : ""}`}
      icon={BoxIcon}
      right={<Badge variant="secondary">{variant.height}</Badge>}
    >
      <div className="flex flex-col gap-2 p-1">
        {variant.render({ display, notifyTap })}
      </div>
    </SummarySection>
  )
}
