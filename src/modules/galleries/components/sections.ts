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

/** Secciones de la galería /settings/appearance/components (#307, #341). */
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
  /**
   * Nombres de las fichas de la sección, en el orden en que se pintan. De aquí
   * salen el conteo de la lista y el buscador; un test comprueba que coincidan
   * con los `name` de los `GalleryDemo` de cada sección.
   */
  demos: readonly string[]
}

/** Una sección por propósito, en el orden en que se leen en el móvil. */
export const COMPONENT_GALLERY_SECTIONS: readonly ComponentGallerySection[] = [
  {
    id: "entradas",
    title: "Entradas y campos",
    description: "Texto, áreas, contraseña y switches de formulario",
    icon: TextCursorInputIcon,
    demos: ["FormTextField", "InputGroup", "SwitchFieldRow"],
  },
  {
    id: "selectores",
    title: "Selectores",
    description: "Filas de opción, celdas de elección y ruedas",
    icon: CircleDotIcon,
    demos: [
      "OptionRow",
      "ChoiceGrid",
      "SelectField",
      "ColorPickerSwatch",
      "WheelField + TimePairWheels",
    ],
  },
  {
    id: "acciones",
    title: "Botones y acciones",
    description: "Variantes, tamaños, icono solo y pending",
    icon: MousePointerClickIcon,
    demos: ["Button", "Button", "Button", "Button asChild", "PendingSurface"],
  },
  {
    id: "overlays",
    title: "Diálogos y sheets",
    description: "Hoja de edición, hoja flotante y confirmación",
    icon: PanelsTopLeftIcon,
    demos: [
      "BottomSheet",
      'BottomSheet variant="floating"',
      'BottomSheet size="wide"',
      "ConfirmDialog",
    ],
  },
  {
    id: "tabs",
    title: "Tabs y chips",
    description: "Tabs con indicador, segmentos y badges",
    icon: TagsIcon,
    demos: ["Tabs", "SegmentedControl", "Badge", "CategoryCard"],
  },
  {
    id: "listas",
    title: "Listas y filas",
    description: "Filas con icono, valor, chevron y switch",
    icon: ListIcon,
    demos: ["SummarySection + SummaryItem", "SettingsSection + SettingsRow"],
  },
  {
    id: "encabezados",
    title: "Encabezados y secciones",
    description: "Bloques con título, subtítulo y grupo",
    icon: TypeIcon,
    demos: [
      "SummarySection",
      "SummarySection collapsible",
      "SummaryGroup",
      "SettingsSection",
      "DetailHeader",
    ],
  },
  {
    id: "estados",
    title: "Estados",
    description: "Vacío, carga y error reintentable",
    icon: ActivityIcon,
    demos: [
      "IconBadge",
      "Empty",
      "Skeleton + ListSkeleton + CardSkeleton",
      'Empty size="sm"',
      "Spinner + LoadingView",
      "ErrorState",
    ],
  },
  {
    id: "avisos",
    title: "Avisos y toasts",
    description: "Alertas en línea, avisos con tono y toasts",
    icon: BellRingIcon,
    demos: ["Alert", "NoticeCard", "appToast"],
  },
  {
    id: "montos",
    title: "Montos y fechas",
    description: "Importes formateados, campo de monto, fecha y hora",
    icon: CoinsIcon,
    demos: [
      "formatFinanceMoney",
      "Money",
      "FinanceMoneyField",
      "FinanceDateField",
      "CurrencyFlag",
    ],
  },
  {
    id: "graficos",
    title: "Gráficos y anillos",
    description: "Gráficos de barras y anillo de progreso",
    icon: ChartPieIcon,
    demos: ["ChartContainer", "ProgressRing", "SubscriptionProgressRing"],
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
