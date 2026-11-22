"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import {
  groupGalleryMatches,
  searchGalleryComponents,
} from "@/src/modules/galleries/components/catalog/search"
import { GALLERY_COMPONENT_METAS } from "@/src/modules/galleries/components/catalog/manifest"
import { GalleryComponentRow } from "@/src/modules/galleries/components/gallery-component-row"
import { GallerySearchEmpty } from "@/src/modules/galleries/components/gallery-search-empty"
import { GallerySearchField } from "@/src/modules/galleries/components/gallery-search-field"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { ItemGroup } from "@/src/shared/components/ui/item"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

/** Índice con búsqueda de todos los componentes de la galería (#417, #597). */
export function ComponentGalleryScreen() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const matches = searchGalleryComponents(search)
  const groups = groupGalleryMatches(matches)
  const searching = search.trim().length > 0

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearance)
  }, [router])

  const subtitle = searching
    ? `${matches.length} resultados`
    : `${GALLERY_COMPONENT_METAS.length} componentes`

  usePageHeader(
    {
      variant: "secondary",
      title: "Componentes",
      subtitle,
      onBack: handleBack,
    },
    [subtitle, handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Documentación de los componentes reales, con datos de ejemplo. Cada
        ficha muestra su vista previa, su código, su composición y su API. Nada
        aquí lee ni escribe datos del usuario ni llama al back.
      </p>

      <GallerySearchField
        value={search}
        onValueChange={setSearch}
        label="Buscar en la galería de componentes"
        placeholder="Buscar componente"
      />

      {matches.length === 0 ? (
        <GallerySearchEmpty
          term={search.trim()}
          onClear={() => setSearch("")}
        />
      ) : (
        <div className="flex min-w-0 flex-col gap-5">
          {groups.map(({ category, components }) => {
            const Icon = category.icon
            return (
              <section
                key={category.id}
                className="flex min-w-0 flex-col gap-2"
              >
                <div className="flex min-w-0 items-center gap-2 px-1">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
                    {category.title}
                  </h2>
                  <Link
                    href={APP_ROUTES.app.settingsAppearanceComponentSection(
                      category.id
                    )}
                    className="relative flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
                  >
                    {components.length} fichas
                    <ChevronRightIcon className="size-3.5" />
                    <LinkPendingOverlay />
                  </Link>
                </div>
                <ItemGroup className="gap-2">
                  {components.map((doc) => (
                    <GalleryComponentRow
                      key={`${doc.category}-${doc.id}`}
                      doc={doc}
                      icon={Icon}
                      query={search}
                    />
                  ))}
                </ItemGroup>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
