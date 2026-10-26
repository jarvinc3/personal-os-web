"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGridIcon, SearchIcon, SearchXIcon } from "lucide-react"

import { searchComponentGallerySections } from "@/src/modules/galleries/components/component-gallery-search"
import { COMPONENT_GALLERY_SECTIONS } from "@/src/modules/galleries/components/sections"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

/** Categorías de la galería de componentes (#307, #341). */
export function ComponentGalleryScreen() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const matches = searchComponentGallerySections(search)
  const searching = search.trim().length > 0

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearance)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Componentes",
      subtitle: `${COMPONENT_GALLERY_SECTIONS.length} categorías`,
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Referencia visual de los componentes reales, con datos de ejemplo. Nada
        aquí lee ni escribe datos del usuario ni llama al back: los toques
        muestran «Toque simulado». Si un componente no aparece, no existe
        todavía y su issue lo agrega.
      </p>

      <FormTextField
        icon={SearchIcon}
        type="search"
        value={search}
        onChange={setSearch}
        placeholder="Buscar componente o categoría"
        ariaLabel="Buscar en la galería de componentes"
        autoComplete="off"
      />

      {matches.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>
              Ninguna categoría ni componente coincide con «{search.trim()}».
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={() => setSearch("")}>
            Limpiar búsqueda
          </Button>
        </Empty>
      ) : (
        <SummarySection title="Categorías" icon={LayoutGridIcon}>
          {matches.map(({ section, matchedDemos }, index) => {
            const Icon = section.icon
            const description =
              searching && matchedDemos.length
                ? `Coincidencias: ${[...new Set(matchedDemos)].join(", ")}`
                : section.description
            return (
              <SummaryItem
                key={section.id}
                title={section.title}
                description={description}
                wrapDescription
                icon={Icon}
                href={APP_ROUTES.app.settingsAppearanceComponentSection(
                  section.id
                )}
                value={
                  <span className="flex flex-col items-end">
                    <span className="font-semibold tabular-nums">
                      {section.demos.length}
                    </span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      fichas
                    </span>
                  </span>
                }
                showChevron
                isLast={index === matches.length - 1}
              />
            )
          })}
        </SummarySection>
      )}
    </div>
  )
}
