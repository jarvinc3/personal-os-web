import type { ReactNode } from "react"

import type { ComponentGallerySectionId } from "@/src/modules/galleries/components/sections"

/** Origen del componente: primitivo de shadcn o wrapper de dominio. */
export type GalleryComponentKind = "ui" | "domain"

/**
 * Un ejemplo real que se pinta en la vista previa, con el código exacto de lo
 * que muestra para que se pueda copiar sin reescribirlo.
 */
export type GalleryDemoItem = {
  label: string
  node: ReactNode
  code: string
}

/** Un elemento de la composición y los que cuelgan de él. */
export type GalleryAnatomyNode = {
  name: string
  children?: readonly GalleryAnatomyNode[]
}

/** Una propiedad del componente con sus valores posibles. */
export type GalleryVariantGroup = {
  name: string
  values: string
}

/**
 * Un ejemplo pintado de una variante o un estado. La etiqueta nombra lo que
 * muestra; el nodo es el componente real.
 */
export type GalleryVariantDemo = {
  label: string
  node: ReactNode
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
  subcomponents: readonly string[]
  /** Composición del componente, de la raíz a las hojas. */
  anatomy: readonly GalleryAnatomyNode[]
  variants: readonly GalleryVariantGroup[]
  props: readonly GalleryProp[]
}

/** Metadatos más la vista previa que se pinta en la página del componente. */
export type GalleryComponentDoc = GalleryComponentMeta & {
  demos: readonly GalleryDemoItem[]
  /** Ejemplos pintados por el `name` de cada grupo de variantes. */
  variantDemos: Record<string, readonly GalleryVariantDemo[]>
}

/** Demos de una categoría, indexados por el id del componente. */
export type GalleryDemoMap = Record<string, readonly GalleryDemoItem[]>

/** Ejemplos de variantes de una categoría, por ficha y por grupo. */
export type GalleryVariantDemoMap = Record<
  string,
  Record<string, readonly GalleryVariantDemo[]>
>
