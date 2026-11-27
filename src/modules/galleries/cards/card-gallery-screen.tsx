"use client"

import { CARD_GALLERY_ENTITIES } from "@/src/modules/galleries/cards/entities"
import { cardGalleryVariants } from "@/src/modules/galleries/cards/variants/registry"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ChevronRightIcon, LayoutGridIcon } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"

/** Lista de entidades de la galería /settings/appearance/cards (#272). */
export function CardGalleryScreen() {
  const handleBack = useBackTo(APP_ROUTES.app.settingsAppearance)

  usePageHeader(
    {
      variant: "secondary",
      title: "Galería de cards",
      subtitle: "Referencia visual",
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Cards reales con datos de ejemplo. Toca una entidad para ver todas sus
        variantes, una por fila. Los cambios de diseño se hacen en el componente
        real.
      </p>
      <SummarySection title="Entidades" icon={LayoutGridIcon}>
        {CARD_GALLERY_ENTITIES.map((entity) => {
          const Icon = entity.icon
          const count = cardGalleryVariants(entity.slug).length
          return (
            <Item
              key={entity.slug}
              variant="default"
              render={
                <Link
                  href={APP_ROUTES.app.settingsAppearanceCardEntity(
                    entity.slug
                  )}
                />
              }
            >
              <ItemMedia variant="icon">
                <Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{entity.name}</ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {entity.description}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {
                    <span className="flex flex-col items-end">
                      <span className="font-semibold tabular-nums">
                        {count}
                      </span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        variantes
                      </span>
                    </span>
                  }
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                <LinkPendingOverlay />
              </ItemActions>
            </Item>
          )
        })}
      </SummarySection>
    </div>
  )
}
