"use client"

import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { ComponentDocTemplate } from "@/src/modules/galleries/components/component-doc-template"
import { galleryComponentInCategory } from "@/src/modules/galleries/components/catalog"
import {
  componentGallerySection,
  type ComponentGallerySectionId,
} from "@/src/modules/galleries/components/sections"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

/** Página de documentación de un componente de la galería (#417). */
export function ComponentDocScreen({
  sectionId,
  componentId,
}: {
  sectionId: ComponentGallerySectionId
  componentId: string
}) {
  const section = componentGallerySection(sectionId)
  const doc = galleryComponentInCategory(sectionId, componentId)
  if (!doc) {
    throw new Error(
      `El componente ${componentId} no pertenece a la categoría ${sectionId}`
    )
  }

  const handleBack = useBackTo(
    APP_ROUTES.app.settingsAppearanceComponentSection(sectionId)
  )

  usePageHeader(
    {
      variant: "secondary",
      title: doc.name,
      subtitle: section.title,
      onBack: handleBack,
    },
    [doc.name, section.title, handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <nav
        aria-label="Ruta de la galería"
        className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
      >
        <Link
          href={APP_ROUTES.app.settingsAppearanceComponents}
          className="relative shrink-0"
        >
          Componentes
          <LinkPendingOverlay />
        </Link>
        <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <Link
          href={APP_ROUTES.app.settingsAppearanceComponentSection(sectionId)}
          className="relative min-w-0 truncate"
        >
          {section.title}
          <LinkPendingOverlay />
        </Link>
      </nav>
      <ComponentDocTemplate doc={doc} />
    </div>
  )
}
