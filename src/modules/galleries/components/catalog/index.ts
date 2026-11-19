import { GALLERY_DEMOS } from "@/src/modules/galleries/components/catalog/demos"
import {
  GALLERY_COMPONENT_METAS,
  galleryMetasInCategory,
} from "@/src/modules/galleries/components/catalog/manifest"
import type { GalleryComponentDoc } from "@/src/modules/galleries/components/catalog/types"
import type { ComponentGallerySectionId } from "@/src/modules/galleries/components/sections"

/**
 * Catálogo completo: los metadatos y sus demos, en el orden de la galería.
 * Falla al cargar si una ficha no tiene vista previa.
 */
export const GALLERY_COMPONENTS: readonly GalleryComponentDoc[] =
  GALLERY_COMPONENT_METAS.map((meta) => {
    const demos = GALLERY_DEMOS[meta.id]
    if (!demos) {
      throw new Error(`La ficha ${meta.id} no tiene demos`)
    }
    return { ...meta, demos }
  })

export function galleryComponentsInCategory(
  category: ComponentGallerySectionId
): readonly GalleryComponentDoc[] {
  return galleryMetasInCategory(category).map((meta) => {
    const doc = GALLERY_COMPONENTS.find((candidate) => candidate.id === meta.id)
    if (!doc) {
      throw new Error(`La ficha ${meta.id} no está en el catálogo`)
    }
    return doc
  })
}

export function galleryComponent(id: string): GalleryComponentDoc {
  const doc = GALLERY_COMPONENTS.find((candidate) => candidate.id === id)
  if (!doc) {
    throw new Error(`Componente de la galería desconocido: ${id}`)
  }
  return doc
}

export function galleryComponentInCategory(
  category: ComponentGallerySectionId,
  id: string
): GalleryComponentDoc | undefined {
  return GALLERY_COMPONENTS.find(
    (candidate) => candidate.category === category && candidate.id === id
  )
}
