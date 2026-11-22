"use client"

import Link from "next/link"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"

import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"
import { GalleryHighlight } from "@/src/modules/galleries/components/gallery-highlight"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

type GalleryComponentRowProps = {
  doc: GalleryComponentMeta
  icon: LucideIcon
  query: string
}

/** Fila de una ficha con su nombre y su descripción resaltados por la búsqueda. */
export function GalleryComponentRow({
  doc,
  icon: Icon,
  query,
}: GalleryComponentRowProps) {
  return (
    <Item
      render={
        <Link
          href={APP_ROUTES.app.settingsAppearanceComponent(
            doc.category,
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
        <ItemTitle>
          <GalleryHighlight text={doc.name} query={query} />
        </ItemTitle>
        <ItemDescription>
          <GalleryHighlight text={doc.description} query={query} />
        </ItemDescription>
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
  )
}
