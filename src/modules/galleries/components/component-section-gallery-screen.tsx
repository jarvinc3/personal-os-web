"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import {
  galleryMatchesInCategory,
  searchGalleryComponentsInCategory,
} from "@/src/modules/galleries/components/catalog/search"
import { GalleryComponentRow } from "@/src/modules/galleries/components/gallery-component-row"
import { GallerySearchEmpty } from "@/src/modules/galleries/components/gallery-search-empty"
import { GallerySearchField } from "@/src/modules/galleries/components/gallery-search-field"
import {
  componentGallerySection,
  type ComponentGallerySectionId,
} from "@/src/modules/galleries/components/sections"
import { ItemGroup } from "@/src/shared/components/ui/item"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

/** Fichas de una categoría de la galería, con su propio buscador (#417, #597). */
export function ComponentSectionGalleryScreen({
  sectionId,
}: {
  sectionId: ComponentGallerySectionId
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const section = componentGallerySection(sectionId)
  const categoryMatches = galleryMatchesInCategory(sectionId)
  const matches = searchGalleryComponentsInCategory(sectionId, search)
  const searching = search.trim().length > 0
  const Icon = section.icon

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearanceComponents)
  }, [router])

  const subtitle = searching
    ? `${matches.length} de ${categoryMatches.length} fichas`
    : `${categoryMatches.length} fichas`

  usePageHeader(
    {
      variant: "secondary",
      title: section.title,
      subtitle,
      onBack: handleBack,
    },
    [section.title, subtitle, handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="sr-only text-sm text-muted-foreground">
        {section.description}
      </p>
      <GallerySearchField
        value={search}
        onValueChange={setSearch}
        label={`Buscar en ${section.title}`}
        placeholder="Buscar en esta categoría"
      />
      {searching && matches.length === 0 ? (
        <GallerySearchEmpty
          term={search.trim()}
          onClear={() => setSearch("")}
        />
      ) : (
        <ItemGroup className="gap-2">
          {matches.map(({ doc }) => (
            <GalleryComponentRow
              key={doc.id}
              doc={doc}
              icon={Icon}
              query={search}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}
