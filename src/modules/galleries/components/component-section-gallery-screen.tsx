"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

import {
  componentGallerySection,
  type ComponentGallerySectionId,
} from "@/src/modules/galleries/components/sections"
import { COMPONENT_GALLERY_SECTION_BODIES } from "@/src/modules/galleries/components/sections/registry"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

/** Fichas de una categoría de la galería de componentes (#341). */
export function ComponentSectionGalleryScreen({
  sectionId,
}: {
  sectionId: ComponentGallerySectionId
}) {
  const router = useRouter()
  const section = componentGallerySection(sectionId)
  const SectionBody = COMPONENT_GALLERY_SECTION_BODIES[sectionId]

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearanceComponents)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: section.title,
      subtitle: `${section.demos.length} fichas`,
      onBack: handleBack,
    },
    [section.title, section.demos.length, handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">{section.description}</p>
      <SectionBody />
    </div>
  )
}
