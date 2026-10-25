"use client"

import { CARD_GALLERY_ENTITIES } from "@/src/modules/card-gallery/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { GalleryVerticalEndIcon, LayersIcon } from "lucide-react"

/** Índice de las galerías de referencia de la app (#272). */
export function DevIndexScreen() {
  usePageHeader({
    title: "Desarrollo",
    subtitle: "Galería de referencia",
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Referencia visual de los componentes reales con datos de ejemplo. Aquí
        se revisa un diseño y el ajuste se aplica al componente que usa la app.
      </p>
      <SummarySection title="Galerías" icon={LayersIcon}>
        <SummaryItem
          title="Galería de cards"
          description="Cada entidad con sus variantes: completa, compacta e inline"
          icon={GalleryVerticalEndIcon}
          href={APP_ROUTES.app.devCardGallery}
          value={
            <span className="font-semibold tabular-nums">
              {CARD_GALLERY_ENTITIES.length}
            </span>
          }
          showChevron
          isLast
        />
      </SummarySection>
    </div>
  )
}
