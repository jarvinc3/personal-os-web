"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { cardGalleryEntity } from "@/src/modules/galleries/cards/entities"
import type { CardGalleryEntitySlug } from "@/src/modules/galleries/cards/entities"
import { GalleryTapProvider } from "@/src/modules/galleries/cards/gallery-tap"
import { GalleryVariantRow } from "@/src/modules/galleries/cards/variant-row"
import { GALLERY_DISPLAY } from "@/src/modules/galleries/cards/mock/display"
import { cardGalleryVariants } from "@/src/modules/galleries/cards/variants/registry"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"

/** Todas las variantes de una entidad, una por fila (#272). */
export function EntityGalleryScreen({ slug }: { slug: CardGalleryEntitySlug }) {
  const router = useRouter()
  const entity = cardGalleryEntity(slug)
  const variants = entity ? cardGalleryVariants(entity.slug) : []
  const title = entity?.name ?? "Entidad"
  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearanceCards)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title,
      subtitle: `${variants.length} variantes`,
      onBack: handleBack,
    },
    [title, variants.length, handleBack]
  )

  if (!entity) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Esta entidad no existe en la galería</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <GalleryTapProvider>
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
        <p className="text-sm text-muted-foreground">{entity.description}</p>
        {variants.map((variant) => (
          <GalleryVariantRow
            key={variant.id}
            variant={variant}
            display={GALLERY_DISPLAY}
          />
        ))}
      </div>
    </GalleryTapProvider>
  )
}
