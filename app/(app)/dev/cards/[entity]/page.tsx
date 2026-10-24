import { notFound } from "next/navigation"
import { Suspense } from "react"

import { EntityGalleryScreen } from "@/src/modules/card-gallery/entity-gallery-screen"
import { isCardGalleryEntitySlug } from "@/src/modules/card-gallery/entities"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type CardGalleryEntityPageProps = {
  params: Promise<{ entity: string }>
}

/** Variantes de una entidad de la galería de cards (#272). */
export default async function CardGalleryEntityPage({
  params,
}: CardGalleryEntityPageProps) {
  const { entity } = await params
  if (!isCardGalleryEntitySlug(entity)) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <EntityGalleryScreen slug={entity} />
    </Suspense>
  )
}
