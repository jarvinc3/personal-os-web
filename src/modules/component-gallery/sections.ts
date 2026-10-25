import type { LucideIcon } from "lucide-react"
import {
  ActivityIcon,
  BellRingIcon,
  ChartPieIcon,
  CircleDotIcon,
  CoinsIcon,
  ListIcon,
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  TagsIcon,
  TextCursorInputIcon,
  TypeIcon,
} from "lucide-react"

/** Secciones de la galería /dev/components (#307). */
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

export type ComponentGallerySection = {
  id: ComponentGallerySectionId
  title: string
  description: string
  icon: LucideIcon
}

/** Una sección por propósito, en el orden en que se leen en el móvil. */
export const COMPONENT_GALLERY_SECTIONS: readonly ComponentGallerySection[] = [
  {
    id: "entradas",
    title: "Entradas y campos",
    description: "Texto, áreas, contraseña y switches de formulario",
    icon: TextCursorInputIcon,
  },
  {
    id: "selectores",
    title: "Selectores",
    description: "Filas de opción, celdas de elección y ruedas",
    icon: CircleDotIcon,
  },
  {
    id: "acciones",
    title: "Botones y acciones",
    description: "Variantes, tamaños, icono solo y pending",
    icon: MousePointerClickIcon,
  },
  {
    id: "overlays",
    title: "Diálogos y sheets",
    description: "Hoja de edición, hoja flotante y confirmación",
    icon: PanelsTopLeftIcon,
  },
  {
    id: "tabs",
    title: "Tabs y chips",
    description: "Tabs con indicador, segmentos y badges",
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
    description: "Vacío, carga y error reintentable",
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
    description: "Importes formateados, campo de monto, fecha y hora",
    icon: CoinsIcon,
  },
  {
    id: "graficos",
    title: "Gráficos y anillos",
    description: "Gráficos de barras y anillo de progreso",
    icon: ChartPieIcon,
  },
]
