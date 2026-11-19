import type { LucideIcon } from "lucide-react"
import {
  ActivityIcon,
  BellRingIcon,
  ChartPieIcon,
  CircleDotIcon,
  CoinsIcon,
  LayersIcon,
  ListIcon,
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  TagsIcon,
  TextCursorInputIcon,
  TypeIcon,
} from "lucide-react"

/** Categorías de la galería /settings/appearance/components (#307, #341, #417). */
export type ComponentGallerySectionId =
  | "entradas"
  | "selectores"
  | "acciones"
  | "overlays"
  | "tabs"
  | "listas"
  | "encabezados"
  | "estados"
  | "avisos"
  | "montos"
  | "graficos"
  | "estructura"

export type ComponentGallerySection = {
  id: ComponentGallerySectionId
  title: string
  description: string
  icon: LucideIcon
}

/**
 * Una categoría por propósito, en el orden en que se leen en el móvil. Las
 * fichas de cada categoría viven en el catálogo (`catalog/entries`), que es la
 * única fuente del índice, del buscador y de cada página de componente.
 */
export const COMPONENT_GALLERY_SECTIONS: readonly ComponentGallerySection[] = [
  {
    id: "entradas",
    title: "Entradas y campos",
    description: "Texto, áreas, casillas, radios y switches de formulario",
    icon: TextCursorInputIcon,
  },
  {
    id: "selectores",
    title: "Selectores",
    description: "Filas de opción, celdas de elección, catálogo y ruedas",
    icon: CircleDotIcon,
  },
  {
    id: "acciones",
    title: "Botones y acciones",
    description: "Variantes, tamaños, grupos y pending",
    icon: MousePointerClickIcon,
  },
  {
    id: "overlays",
    title: "Diálogos y sheets",
    description: "Hoja de edición, hoja flotante, menús y confirmación",
    icon: PanelsTopLeftIcon,
  },
  {
    id: "tabs",
    title: "Tabs y chips",
    description: "Tabs con indicador, segmentos, badges y categorías",
    icon: TagsIcon,
  },
  {
    id: "listas",
    title: "Listas y filas",
    description: "Filas con icono, valor, chevron y switch",
    icon: ListIcon,
  },
  {
    id: "encabezados",
    title: "Encabezados y secciones",
    description: "Bloques con título, subtítulo y grupo",
    icon: TypeIcon,
  },
  {
    id: "estados",
    title: "Estados",
    description: "Vacío, carga, error y progreso",
    icon: ActivityIcon,
  },
  {
    id: "avisos",
    title: "Avisos y toasts",
    description: "Alertas en línea, avisos con tono y toasts",
    icon: BellRingIcon,
  },
  {
    id: "montos",
    title: "Montos y fechas",
    description: "Importes formateados, campo de monto, fecha y moneda",
    icon: CoinsIcon,
  },
  {
    id: "graficos",
    title: "Gráficos y anillos",
    description: "Gráficos de barras y anillos de progreso",
    icon: ChartPieIcon,
  },
  {
    id: "estructura",
    title: "Estructura",
    description: "Tarjetas, separadores, scroll y bloques de código",
    icon: LayersIcon,
  },
]

const SECTION_IDS = new Set<string>(
  COMPONENT_GALLERY_SECTIONS.map((section) => section.id)
)

export function isComponentGallerySectionId(
  value: string
): value is ComponentGallerySectionId {
  return SECTION_IDS.has(value)
}

export function componentGallerySection(
  id: ComponentGallerySectionId
): ComponentGallerySection {
  const section = COMPONENT_GALLERY_SECTIONS.find(
    (candidate) => candidate.id === id
  )
  if (!section) {
    throw new Error(`Sección de la galería desconocida: ${id}`)
  }
  return section
}
