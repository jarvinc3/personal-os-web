import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ComponentSectionGalleryScreen } from "@/src/modules/galleries/components/component-section-gallery-screen"
import { isComponentGallerySectionId } from "@/src/modules/galleries/components/sections"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type ComponentGallerySectionPageProps = {
  params: Promise<{ section: string }>
}

/** Fichas de una categoría de la galería de componentes (#341). */
export default async function ComponentGallerySectionPage({
  params,
}: ComponentGallerySectionPageProps) {
  const { section } = await params
  if (!isComponentGallerySectionId(section)) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingView />}>
      <ComponentSectionGalleryScreen sectionId={section} />
    </Suspense>
  )
}
