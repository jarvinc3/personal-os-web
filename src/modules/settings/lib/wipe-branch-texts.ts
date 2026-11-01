import {
  ArrowLeftRight,
  Banknote,
  Bell,
  Coins,
  CreditCard,
  Database,
  FileText,
  Gauge,
  HandCoins,
  Landmark,
  PiggyBank,
  RefreshCcw,
  Repeat,
  RotateCcw,
  Scale,
  Settings,
  Smartphone,
  Sparkles,
  Store,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { DATA_APP } from "@/src/modules/settings/types/wipe.types"

const FALLBACK_ICON = Database

export const FINANCE_BRANCH_THEME = {
  MOVEMENTS: "movements",
  PRODUCTS: "products",
  PLANNING: "planning",
  DIRECTORY: "directory",
  OTHER: "other",
} as const

export type FinanceBranchThemeId =
  (typeof FINANCE_BRANCH_THEME)[keyof typeof FINANCE_BRANCH_THEME]

export const FINANCE_BRANCH_THEMES = [
  {
    id: FINANCE_BRANCH_THEME.MOVEMENTS,
    label: "Movimientos y saldos",
    icon: ArrowLeftRight,
  },
  { id: FINANCE_BRANCH_THEME.PRODUCTS, label: "Productos", icon: Landmark },
  {
    id: FINANCE_BRANCH_THEME.PLANNING,
    label: "Planificación",
    icon: PiggyBank,
  },
  {
    id: FINANCE_BRANCH_THEME.DIRECTORY,
    label: "Comercios y categorías",
    icon: Store,
  },
] as const

export type FinanceBranchTheme = {
  id: FinanceBranchThemeId
  label: string
  icon: LucideIcon
}

export const OTHER_FINANCE_THEME_ITEM: FinanceBranchTheme = {
  id: FINANCE_BRANCH_THEME.OTHER,
  label: "Otras ramas",
  icon: FALLBACK_ICON,
}

type BranchUnit = { singular: string; plural: string }

type WipeBranchText = {
  label: string
  description: string
  icon: LucideIcon
  theme?: FinanceBranchThemeId
  unit: BranchUnit
}

/**
 * The only place with the copy of each branch. Identifiers, dependencies and
 * order still come from GET /users/me/data/branches; a branch without an entry
 * here shows the label the API sent and a plain row.
 */
export const WIPE_BRANCH_TEXTS: Record<string, WipeBranchText> = {
  "finance.reconciliations": {
    label: "Conciliaciones y descuadres",
    description:
      "Conciliaciones con sus ajustes y descuadres detectados. Los movimientos de ajuste se conservan.",
    icon: Scale,
    theme: FINANCE_BRANCH_THEME.MOVEMENTS,
    unit: { singular: "conciliación", plural: "conciliaciones" },
  },
  "finance.transactions": {
    label: "Movimientos y transferencias",
    description:
      "Movimientos de todo tipo. Deja las cuentas en cero y el disponible de las tarjetas en su límite.",
    icon: ArrowLeftRight,
    theme: FINANCE_BRANCH_THEME.MOVEMENTS,
    unit: { singular: "movimiento", plural: "movimientos" },
  },
  "finance.balances": {
    label: "Saldos a cero",
    description:
      "Pone en cero las cuentas y devuelve el disponible de las tarjetas a su límite. No borra filas.",
    icon: Gauge,
    theme: FINANCE_BRANCH_THEME.MOVEMENTS,
    unit: { singular: "saldo", plural: "saldos" },
  },
  "finance.cards": {
    label: "Tarjetas de crédito",
    description:
      "Tarjetas de crédito con sus saldos. Las suscripciones quedan sin tarjeta.",
    icon: CreditCard,
    theme: FINANCE_BRANCH_THEME.PRODUCTS,
    unit: { singular: "tarjeta", plural: "tarjetas" },
  },
  "finance.debitCards": {
    label: "Tarjetas de débito",
    description:
      "Tarjetas de débito vinculadas a una cuenta; se borran con ella.",
    icon: CreditCard,
    theme: FINANCE_BRANCH_THEME.PRODUCTS,
    unit: { singular: "tarjeta", plural: "tarjetas" },
  },
  "finance.accounts": {
    label: "Cuentas, incluido el efectivo",
    description:
      "Cuentas con sus movimientos y sus tarjetas de débito. Metas, cobros y suscripciones quedan sin cuenta.",
    icon: Wallet,
    theme: FINANCE_BRANCH_THEME.PRODUCTS,
    unit: { singular: "cuenta", plural: "cuentas" },
  },
  "finance.institutions": {
    label: "Instituciones",
    description: "Instituciones que no son de sistema: «Efectivo» se conserva.",
    icon: Landmark,
    theme: FINANCE_BRANCH_THEME.PRODUCTS,
    unit: { singular: "institución", plural: "instituciones" },
  },
  "finance.statements": {
    label: "Estados de cuenta",
    description:
      "Estados de cuenta importados y sus importaciones. Las tarjetas siguen existiendo.",
    icon: FileText,
    theme: FINANCE_BRANCH_THEME.PRODUCTS,
    unit: { singular: "estado de cuenta", plural: "estados de cuenta" },
  },
  "finance.subscriptions": {
    label: "Suscripciones",
    description:
      "Suscripciones con sus pagos y alertas descartadas. Los movimientos siguen.",
    icon: Repeat,
    theme: FINANCE_BRANCH_THEME.PLANNING,
    unit: { singular: "suscripción", plural: "suscripciones" },
  },
  "finance.recurring": {
    label: "Recurrentes detectados",
    description:
      "Patrones recurrentes detectados. Las suscripciones conservan sus datos.",
    icon: RefreshCcw,
    theme: FINANCE_BRANCH_THEME.DIRECTORY,
    unit: { singular: "patrón", plural: "patrones" },
  },
  "finance.merchants": {
    label: "Comercios",
    description:
      "Comercios con sus alias. Movimientos y recurrentes conservan el texto, sin comercio.",
    icon: Store,
    theme: FINANCE_BRANCH_THEME.DIRECTORY,
    unit: { singular: "comercio", plural: "comercios" },
  },
  "finance.categories": {
    label: "Categorías propias",
    description: "Categorías creadas por ti. Las del sistema se conservan.",
    icon: Tags,
    theme: FINANCE_BRANCH_THEME.DIRECTORY,
    unit: { singular: "categoría", plural: "categorías" },
  },
  "finance.loans": {
    label: "Préstamos",
    description: "Préstamos con sus cuotas y pagos anticipados.",
    icon: Banknote,
    theme: FINANCE_BRANCH_THEME.PLANNING,
    unit: { singular: "préstamo", plural: "préstamos" },
  },
  "finance.savingsGoals": {
    label: "Metas de ahorro",
    description: "Metas con sus aportes.",
    icon: PiggyBank,
    theme: FINANCE_BRANCH_THEME.PLANNING,
    unit: { singular: "meta", plural: "metas" },
  },
  "finance.receivables": {
    label: "Cobros",
    description: "Cobros con sus compartidos y pagos.",
    icon: HandCoins,
    theme: FINANCE_BRANCH_THEME.PLANNING,
    unit: { singular: "cobro", plural: "cobros" },
  },
  "finance.budgets": {
    label: "Presupuestos",
    description: "Presupuestos con sus categorías y alertas.",
    icon: Coins,
    theme: FINANCE_BRANCH_THEME.PLANNING,
    unit: { singular: "presupuesto", plural: "presupuestos" },
  },
  "ai.inferences": {
    label: "Historial de uso de IA",
    description: "Telemetría de inferencia del asistente.",
    icon: Sparkles,
    unit: { singular: "inferencia", plural: "inferencias" },
  },
  "notifications.history": {
    label: "Historial de notificaciones",
    description: "Avisos recibidos en la app.",
    icon: Bell,
    unit: { singular: "aviso", plural: "avisos" },
  },
  "notifications.pushTokens": {
    label: "Tokens push",
    description: "Dispositivos que reciben avisos push.",
    icon: Smartphone,
    unit: { singular: "token", plural: "tokens" },
  },
  "settings.defaults": {
    label: "Configuración por defecto",
    description:
      "Vuelve las preferencias y la configuración de las apps a sus valores por defecto.",
    icon: RotateCcw,
    unit: { singular: "ajuste", plural: "ajustes" },
  },
}

const WIPE_APP_TEXTS: Record<string, { label: string; icon: LucideIcon }> = {
  [DATA_APP.FINANCE]: { label: "Finanzas", icon: Landmark },
  [DATA_APP.AI]: { label: "Asistente IA", icon: Sparkles },
  [DATA_APP.NOTIFICATIONS]: { label: "Notificaciones", icon: Bell },
  [DATA_APP.SETTINGS]: { label: "Configuración", icon: Settings },
}

export type WipeBranchCopy = {
  label: string
  description?: string
  icon: LucideIcon
  theme?: FinanceBranchThemeId
  unit?: BranchUnit
}

export function wipeAppCopy(app: string): { label: string; icon: LucideIcon } {
  return WIPE_APP_TEXTS[app] ?? { label: app, icon: FALLBACK_ICON }
}

export function wipeBranchCopy(branch: {
  id: string
  label: string
}): WipeBranchCopy {
  return (
    WIPE_BRANCH_TEXTS[branch.id] ?? {
      label: branch.label,
      icon: FALLBACK_ICON,
    }
  )
}

export function financeBranchThemeOf(branchId: string): FinanceBranchTheme {
  const themeId =
    WIPE_BRANCH_TEXTS[branchId]?.theme ?? FINANCE_BRANCH_THEME.OTHER
  return (
    FINANCE_BRANCH_THEMES.find((theme) => theme.id === themeId) ??
    OTHER_FINANCE_THEME_ITEM
  )
}
