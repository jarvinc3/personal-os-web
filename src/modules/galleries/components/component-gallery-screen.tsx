"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRightIcon, SearchIcon, SearchXIcon, XIcon } from "lucide-react"

import { GALLERY_COMPONENT_METAS } from "@/src/modules/galleries/components/catalog/manifest"
import {
  groupGalleryMatches,
  searchGalleryComponents,
} from "@/src/modules/galleries/components/catalog/search"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { Button } from "@/src/shared/components/ui/button"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

/** Índice con búsqueda de todos los componentes de la galería (#417). */
export function ComponentGalleryScreen() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const matches = searchGalleryComponents(search)
  const groups = groupGalleryMatches(matches)
  const searching = search.trim().length > 0

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearance)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Componentes",
      subtitle: searching
        ? `${matches.length} resultados`
        : `${GALLERY_COMPONENT_METAS.length} componentes`,
      onBack: handleBack,
    },
    [matches.length, searching, handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Documentación de los componentes reales, con datos de ejemplo. Cada
        ficha muestra su vista previa, su código, su composición y su API. Nada
        aquí lee ni escribe datos del usuario ni llama al back.
      </p>

      <InputGroup className="h-10">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar componente"
          aria-label="Buscar en la galería de componentes"
          autoComplete="off"
        />
      </InputGroup>

      {matches.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>
              Ningún componente coincide con «{search.trim()}».
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={() => setSearch("")}>
            <XIcon />
            Limpiar búsqueda
          </Button>
        </Empty>
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
                    <Item
                      key={`${doc.category}-${doc.id}`}
                      render={
                        <Link href={componentRoute(doc)} className="relative" />
                      }
                      className="items-center"
                    >
                      <ItemMedia variant="icon">
                        <Icon />
                      </ItemMedia>
                      <ItemContent className="min-w-0">
                        <ItemTitle>{doc.name}</ItemTitle>
                        <ItemDescription>{doc.description}</ItemDescription>
                        <code className="block truncate text-[0.7rem] text-muted-foreground">
                          {doc.importPath}
                        </code>
                      </ItemContent>
                      <ItemActions>
                        <Badge
                          variant={doc.kind === "ui" ? "secondary" : "outline"}
                        >
                          {doc.kind === "ui" ? "shadcn" : "dominio"}
                        </Badge>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                      </ItemActions>
                      <LinkPendingOverlay />
                    </Item>
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

function componentRoute(doc: { category: string; id: string }): string {
  return APP_ROUTES.app.settingsAppearanceComponent(doc.category, doc.id)
}
