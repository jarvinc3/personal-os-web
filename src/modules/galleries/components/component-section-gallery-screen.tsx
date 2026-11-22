"use client"

import { useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import { galleryMatchesInCategory } from "@/src/modules/galleries/components/catalog/search"
import {
  componentGallerySection,
  type ComponentGallerySectionId,
} from "@/src/modules/galleries/components/sections"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { Badge } from "@/src/shared/components/ui/badge"
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

/** Fichas de una categoría de la galería, con enlace a su documentación (#417). */
export function ComponentSectionGalleryScreen({
  sectionId,
}: {
  sectionId: ComponentGallerySectionId
}) {
  const router = useRouter()
  const section = componentGallerySection(sectionId)
  const matches = galleryMatchesInCategory(sectionId)
  const Icon = section.icon

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.settingsAppearanceComponents)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: section.title,
      subtitle: `${matches.length} fichas`,
      onBack: handleBack,
    },
    [section.title, matches.length, handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-4 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">{section.description}</p>
      <ItemGroup className="gap-2">
        {matches.map(({ doc }) => (
          <Item
            key={doc.id}
            render={
              <Link
                href={APP_ROUTES.app.settingsAppearanceComponent(
                  section.id,
                  doc.id
                )}
                className="relative"
              />
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
              <Badge variant={doc.kind === "ui" ? "secondary" : "outline"}>
                {doc.kind === "ui" ? "shadcn" : "dominio"}
              </Badge>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </ItemActions>
            <LinkPendingOverlay />
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
