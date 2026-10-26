import { foldSearchText } from "@/src/shared/lib/search-text"
import {
  COMPONENT_GALLERY_SECTIONS,
  type ComponentGallerySection,
} from "@/src/modules/galleries/components/sections"

export type ComponentGallerySectionMatch = {
  section: ComponentGallerySection
  /** Fichas cuyo nombre coincide con la búsqueda, en el orden de la galería. */
  matchedDemos: readonly string[]
}

function matches(haystack: readonly string[], needle: string): boolean {
  return haystack.some((value) => foldSearchText(value).includes(needle))
}

/**
 * Filtra las categorías por título, descripción o nombre de una ficha, sin
 * acentos ni mayúsculas. Sin búsqueda devuelve todas las categorías.
 */
export function searchComponentGallerySections(
  query: string
): readonly ComponentGallerySectionMatch[] {
  const needle = foldSearchText(query)
  if (!needle) {
    return COMPONENT_GALLERY_SECTIONS.map((section) => ({
      section,
      matchedDemos: [],
    }))
  }

  return COMPONENT_GALLERY_SECTIONS.flatMap((section) => {
    const matchedDemos = section.demos.filter((demo) =>
      foldSearchText(demo).includes(needle)
    )
    const matchesSection = matches([section.title, section.description], needle)
    if (!matchesSection && matchedDemos.length === 0) {
      return []
    }
    return [{ section, matchedDemos }]
  })
}
