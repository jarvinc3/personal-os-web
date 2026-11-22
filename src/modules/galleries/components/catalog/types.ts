import type { ReactNode } from "react"

import type { ComponentGallerySectionId } from "@/src/modules/galleries/components/sections"

/** Origen del componente: primitivo de shadcn o wrapper de dominio. */
export type GalleryComponentKind = "ui" | "domain"

/** Un ejemplo real que se pinta en la vista previa. */
export type GalleryDemoItem = {
  label: string
  node: ReactNode
}

/** Una propiedad del componente con sus valores posibles. */
export type GalleryVariantGroup = {
  name: string
  values: string
}

/** Una prop principal, con tipo y para qué sirve. */
export type GalleryProp = {
  name: string
  type: string
  description: string
}

/**
 * Metadatos de un componente. Viven sin JSX para que las pruebas crucen el
 * catálogo con `/ui/` sin ejecutar React.
 */
export type GalleryComponentMeta = {
  /** Slug de la ruta del componente, estable dentro de su categoría. */
  id: string
  name: string
  category: ComponentGallerySectionId
  kind: GalleryComponentKind
  description: string
  whenToUse: string
  whenNotToUse: string
  importPath: string
  snippet: string
  /** Código del ejemplo de la vista previa; por defecto, el snippet. */
  demoCode?: string
  subcomponents: readonly string[]
  anatomy: string
  variants: readonly GalleryVariantGroup[]
  props: readonly GalleryProp[]
}

/** Metadatos más la vista previa que se pinta en la página del componente. */
export type GalleryComponentDoc = GalleryComponentMeta & {
  demos: readonly GalleryDemoItem[]
}

/** Demos de una categoría, indexados por el id del componente. */
export type GalleryDemoMap = Record<string, readonly GalleryDemoItem[]>
