import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"
import { accionesDocs } from "@/src/modules/galleries/components/catalog/entries/acciones"
import { avisosDocs } from "@/src/modules/galleries/components/catalog/entries/avisos"
import { encabezadosDocs } from "@/src/modules/galleries/components/catalog/entries/encabezados"
import { entradasDocs } from "@/src/modules/galleries/components/catalog/entries/entradas"
import { estadosDocs } from "@/src/modules/galleries/components/catalog/entries/estados"
import { estructuraDocs } from "@/src/modules/galleries/components/catalog/entries/estructura"
import { graficosDocs } from "@/src/modules/galleries/components/catalog/entries/graficos"
import { listasDocs } from "@/src/modules/galleries/components/catalog/entries/listas"
import { montosDocs } from "@/src/modules/galleries/components/catalog/entries/montos"
import { overlaysDocs } from "@/src/modules/galleries/components/catalog/entries/overlays"
import { selectoresDocs } from "@/src/modules/galleries/components/catalog/entries/selectores"
import { tabsDocs } from "@/src/modules/galleries/components/catalog/entries/tabs"
import {
  COMPONENT_GALLERY_SECTIONS,
  type ComponentGallerySectionId,
} from "@/src/modules/galleries/components/sections"

/** Fichas de cada categoría, en el orden en que se leen. */
export const GALLERY_METAS_BY_CATEGORY: Record<
  ComponentGallerySectionId,
  readonly GalleryComponentMeta[]
> = {
  entradas: entradasDocs,
  selectores: selectoresDocs,
  acciones: accionesDocs,
  overlays: overlaysDocs,
  tabs: tabsDocs,
  listas: listasDocs,
  encabezados: encabezadosDocs,
  estados: estadosDocs,
  avisos: avisosDocs,
  montos: montosDocs,
  graficos: graficosDocs,
  estructura: estructuraDocs,
}

/** Todos los metadatos, agrupados por categoría en el orden de la galería. */
export const GALLERY_COMPONENT_METAS: readonly GalleryComponentMeta[] =
  COMPONENT_GALLERY_SECTIONS.flatMap(
    (section) => GALLERY_METAS_BY_CATEGORY[section.id]
  )

export function galleryMetasInCategory(
  category: ComponentGallerySectionId
): readonly GalleryComponentMeta[] {
  return GALLERY_METAS_BY_CATEGORY[category]
}

export function galleryMeta(id: string): GalleryComponentMeta {
  const meta = GALLERY_COMPONENT_METAS.find((candidate) => candidate.id === id)
  if (!meta) {
    throw new Error(`Componente de la galería desconocido: ${id}`)
  }
  return meta
}

export function galleryMetaInCategory(
  category: ComponentGallerySectionId,
  id: string
): GalleryComponentMeta | undefined {
  return GALLERY_METAS_BY_CATEGORY[category].find(
    (candidate) => candidate.id === id
  )
}
