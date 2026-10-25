"use client"

import { CARD_GALLERY_ENTITIES } from "@/src/modules/card-gallery/entities"
import { cardGalleryVariants } from "@/src/modules/card-gallery/variants/registry"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { LayoutGridIcon } from "lucide-react"

/** Lista de entidades de la galería /dev/cards (#272). */
export function CardGalleryScreen() {
  usePageHeader({
    title: "Galería de cards",
    subtitle: "Referencia visual",
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Cards reales con datos de ejemplo. Toca una entidad para ver todas sus
        variantes, una por fila. Los cambios de diseño se hacen en el componente
        real.
      </p>
      <SummarySection title="Entidades" icon={LayoutGridIcon}>
        {CARD_GALLERY_ENTITIES.map((entity, index) => {
          const Icon = entity.icon
          const count = cardGalleryVariants(entity.slug).length
          return (
            <SummaryItem
              key={entity.slug}
              title={entity.name}
              description={entity.description}
              icon={Icon}
              href={APP_ROUTES.app.devCardGalleryEntity(entity.slug)}
              value={
                <span className="flex flex-col items-end">
                  <span className="font-semibold tabular-nums">{count}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    variantes
                  </span>
                </span>
              }
              showChevron
              isLast={index === CARD_GALLERY_ENTITIES.length - 1}
            />
          )
        })}
      </SummarySection>
    </div>
  )
}
