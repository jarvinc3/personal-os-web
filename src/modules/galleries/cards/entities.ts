import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRightIcon,
  BellIcon,
  ChartPieIcon,
  CreditCardIcon,
  FileSpreadsheetIcon,
  HandCoinsIcon,
  HandshakeIcon,
  LandmarkIcon,
  MailSearchIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  RefreshCwIcon,
  RepeatIcon,
  ScaleIcon,
  SparklesIcon,
  StoreIcon,
  TagsIcon,
  TriangleAlertIcon,
  WalletIcon,
} from "lucide-react"

/** Catálogo de entidades de la galería /settings/appearance/cards (#272). */
export type CardGalleryEntitySlug =
  | "institucion"
  | "cuenta"
  | "tarjeta"
  | "prestamo"
  | "meta"
  | "cobro"
  | "presupuesto"
  | "suscripcion"
  | "categoria"
  | "comercio"
  | "movimiento"
  | "detalle-movimiento"
  | "estado-cuenta"
  | "patrimonio"
  | "recurrente"
  | "detectado"
  | "notificacion"
  | "chat"
  | "avisos"

export type CardGalleryEntity = {
  slug: CardGalleryEntitySlug
  name: string
  description: string
  icon: LucideIcon
}

export const CARD_GALLERY_ENTITIES: readonly CardGalleryEntity[] = [
  {
    slug: "institucion",
    name: "Institución y efectivo",
    description: "Completa, compacta y efectivo",
    icon: LandmarkIcon,
  },
  {
    slug: "cuenta",
    name: "Cuenta",
    description: "Completa, compacta e inline",
    icon: WalletIcon,
  },
  {
    slug: "tarjeta",
    name: "Tarjeta",
    description: "Fila, cara, compacta e inline",
    icon: CreditCardIcon,
  },
  {
    slug: "prestamo",
    name: "Préstamo",
    description: "Con color, compacta y saldado",
    icon: HandCoinsIcon,
  },
  {
    slug: "meta",
    name: "Meta de ahorro",
    description: "Completa, compacta y superada",
    icon: PiggyBankIcon,
  },
  {
    slug: "cobro",
    name: "Cobro",
    description: "Completa, compacta y seleccionada",
    icon: HandshakeIcon,
  },
  {
    slug: "presupuesto",
    name: "Presupuesto",
    description: "Normal, en riesgo y excedido",
    icon: ChartPieIcon,
  },
  {
    slug: "suscripcion",
    name: "Suscripción",
    description: "Aviso, compacta y pausada",
    icon: RepeatIcon,
  },
  {
    slug: "categoria",
    name: "Categoría",
    description: "Fila, chip y subcategorías",
    icon: TagsIcon,
  },
  {
    slug: "comercio",
    name: "Comercio",
    description: "Con tinte de su categoría",
    icon: StoreIcon,
  },
  {
    slug: "movimiento",
    name: "Movimiento",
    description: "Gasto, ingreso y estados",
    icon: ArrowLeftRightIcon,
  },
  {
    slug: "detalle-movimiento",
    name: "Detalle de movimiento",
    description: "Encabezado y cards compactas",
    icon: ReceiptTextIcon,
  },
  {
    slug: "estado-cuenta",
    name: "Estado de cuenta",
    description: "La fila de movimiento con su modelo",
    icon: FileSpreadsheetIcon,
  },
  {
    slug: "patrimonio",
    name: "Patrimonio",
    description: "Una card por tipo",
    icon: ScaleIcon,
  },
  {
    slug: "recurrente",
    name: "Recurrente detectado",
    description: "Comercio compacto con Confirmar",
    icon: RefreshCwIcon,
  },
  {
    slug: "detectado",
    name: "Propuesta de producto",
    description: "Cuenta, tarjeta y aprobada",
    icon: MailSearchIcon,
  },
  {
    slug: "notificacion",
    name: "Notificación",
    description: "Leída y no leída",
    icon: BellIcon,
  },
  {
    slug: "chat",
    name: "Chat de IA",
    description: "Entidades completas",
    icon: SparklesIcon,
  },
  {
    slug: "avisos",
    name: "Avisos",
    description: "Descuadre y suscripción",
    icon: TriangleAlertIcon,
  },
]

export function cardGalleryEntity(slug: string): CardGalleryEntity | undefined {
  return CARD_GALLERY_ENTITIES.find((entity) => entity.slug === slug)
}

export function isCardGalleryEntitySlug(
  value: string
): value is CardGalleryEntitySlug {
  return CARD_GALLERY_ENTITIES.some((entity) => entity.slug === value)
}
