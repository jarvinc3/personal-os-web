import { foldSearchText } from "@/src/shared/lib/search-text"
import {
  GALLERY_COMPONENT_METAS,
  galleryMetasInCategory,
} from "@/src/modules/galleries/components/catalog/manifest"
import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"
import {
  COMPONENT_GALLERY_SECTIONS,
  componentGallerySection,
  type ComponentGallerySection,
} from "@/src/modules/galleries/components/sections"

export type GalleryComponentMatch = {
  doc: GalleryComponentMeta
  category: ComponentGallerySection
}

function matches(values: readonly string[], needle: string): boolean {
  return values.some((value) => foldSearchText(value).includes(needle))
}

function asMatch(doc: GalleryComponentMeta): GalleryComponentMatch {
  return { doc, category: componentGallerySection(doc.category) }
}

function matchesQuery(doc: GalleryComponentMeta, needle: string): boolean {
  const category = componentGallerySection(doc.category)
  return matches(
    [
      doc.name,
      doc.description,
      doc.whenToUse,
      doc.importPath,
      category.title,
      ...doc.subcomponents,
    ],
    needle
  )
}

/**
 * Filtra el catálogo por nombre, descripción, categoría, subcomponentes o ruta
 * de importación, sin acentos ni mayúsculas. Sin búsqueda devuelve todo.
 */
export function searchGalleryComponents(
  query: string
): readonly GalleryComponentMatch[] {
  const needle = foldSearchText(query)
  if (!needle) {
    return GALLERY_COMPONENT_METAS.map(asMatch)
  }

  return GALLERY_COMPONENT_METAS.filter((doc) => matchesQuery(doc, needle)).map(
    asMatch
  )
}

/** Agrupa las coincidencias por categoría, en el orden de la galería. */
export function groupGalleryMatches(
  matches: readonly GalleryComponentMatch[]
): readonly {
  category: ComponentGallerySection
  components: readonly GalleryComponentMeta[]
}[] {
  return COMPONENT_GALLERY_SECTIONS.flatMap((category) => {
    const components = matches
      .filter((match) => match.category.id === category.id)
      .map((match) => match.doc)
    if (components.length === 0) {
      return []
    }
    return [{ category, components }]
  })
}

/** Fichas de una categoría, con su categoría ya resuelta. */
export function galleryMatchesInCategory(
  categoryId: string
): readonly GalleryComponentMatch[] {
  const category = COMPONENT_GALLERY_SECTIONS.find(
    (candidate) => candidate.id === categoryId
  )
  if (!category) {
    return []
  }
  return galleryMetasInCategory(category.id).map((doc) => ({
    doc,
    category,
  }))
}

/**
 * Fichas de una categoría que coinciden con la búsqueda, con el mismo criterio
 * que el índice. Sin búsqueda devuelve todas las de la categoría.
 */
export function searchGalleryComponentsInCategory(
  categoryId: string,
  query: string
): readonly GalleryComponentMatch[] {
  const needle = foldSearchText(query)
  const categoryMatches = galleryMatchesInCategory(categoryId)

  if (!needle) {
    return categoryMatches
  }

  return categoryMatches.filter((match) => matchesQuery(match.doc, needle))
}
