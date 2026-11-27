import { notFound } from "next/navigation"
import { Suspense } from "react"

import { galleryMetaInCategory } from "@/src/modules/galleries/components/catalog/manifest"
import { ComponentDocScreen } from "@/src/modules/galleries/components/component-doc-screen"
import { isComponentGallerySectionId } from "@/src/modules/galleries/components/sections"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type ComponentDocPageProps = {
  params: Promise<{ section: string; component: string }>
}

/** Documentación de un componente de la galería (#417). */
export default async function ComponentDocPage({
  params,
}: ComponentDocPageProps) {
  const { section, component } = await params
  if (!isComponentGallerySectionId(section)) {
    notFound()
  }
  if (!galleryMetaInCategory(section, component)) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingView />}>
      <ComponentDocScreen sectionId={section} componentId={component} />
    </Suspense>
  )
}
