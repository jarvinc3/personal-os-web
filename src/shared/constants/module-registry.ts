import type { ModuleSlug } from "@/src/shared/types/module-nav"
import {
  BarChart3,
  BarChart3Icon,
  BriefcaseBusinessIcon,
  Calendar,
  MonitorIcon,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type ModuleDefinition = {
  slug: ModuleSlug
  id: string
  key: string
  label: string
  description: string
  accent: string
  icon: LucideIcon
  iconColorClass: string
  iconBgClass: string
  order: number
}

function createModuleDefinition(
  definition: Omit<ModuleDefinition, "iconColorClass" | "iconBgClass">
): ModuleDefinition {
  return {
    ...definition,
    iconColorClass: definition.accent,
    iconBgClass: `${definition.accent}/10`,
  }
}

export const MODULE_REGISTRY: Record<ModuleSlug, ModuleDefinition> = {
  finance: createModuleDefinition({
    slug: "finance",
    id: "cc5b2284-f639-42a5-b9eb-b167840b8788",
    key: "fin",
    label: "Finanzas",
    description:
      "Este modulo es el encargado de la gestion de las finanzas del usuario.",
    accent: "#10B981",
    icon: BarChart3Icon,
    order: 0,
  }),
  agenda: createModuleDefinition({
    slug: "agenda",
    id: "a2ec64aa-d8ee-4f3e-a526-da69a6e97b58",
    key: "agn",
    label: "Agenda",
    description:
      "Este modulo es el encargado de la gestion de la agenda del usuario.",
    accent: "#3B82F6",
    icon: Calendar,
    order: 1,
  }),
  projects: createModuleDefinition({
    slug: "projects",
    id: "ecefaede-2f40-4f7e-9d7d-71abd019505e",
    key: "prj",
    label: "Proyectos",
    description:
      "Este modulo es el encargado de la gestion de los proyectos del usuario.",
    accent: "#8B5CF6",
    icon: BriefcaseBusinessIcon,
    order: 2,
  }),
  subscriptions: createModuleDefinition({
    slug: "subscriptions",
    id: "7677a8ab-f1aa-4c9e-8fff-5ea2caddad9c",
    key: "sub",
    label: "Suscripciones",
    description:
      "Este modulo es el encargado de la gestion de las suscripciones del usuario.",
    accent: "#F97316",
    icon: Wallet,
    order: 3,
  }),
  health: createModuleDefinition({
    slug: "health",
    id: "fd782bbe-51ef-4f09-abd1-5c9885380b47",
    key: "hlth",
    label: "Salud",
    description:
      "Este modulo es el encargado de la gestion de la salud del usuario.",
    accent: "#EF4444",
    icon: BarChart3,
    order: 4,
  }),
  keepAwake: createModuleDefinition({
    slug: "keepAwake",
    id: "64356435-6435-6435-6435-643564356435",
    key: "kaw",
    label: "Keep Awake",
    description:
      "Este modulo es el encargado de la gestion de la keep awake del usuario.",
    accent: "#45AAF2",
    icon: MonitorIcon,
    order: 5,
  }),
}

export const MODULE_SLUGS_ORDER = (
  Object.values(MODULE_REGISTRY) as ModuleDefinition[]
)
  .sort((a, b) => a.order - b.order)
  .map((moduleDef) => moduleDef.slug)

const MODULE_SLUG_SET = new Set<string>(MODULE_SLUGS_ORDER)

export function getModule(slug: ModuleSlug): ModuleDefinition {
  return MODULE_REGISTRY[slug]
}

export function isModuleSlug(value: string): value is ModuleSlug {
  return MODULE_SLUG_SET.has(value)
}

export function parseModuleSlugFromNotificationData(
  data: Record<string, unknown> | null | undefined
): ModuleSlug | null {
  const raw = data?.moduleSlug
  if (typeof raw !== "string" || !isModuleSlug(raw)) {
    return null
  }
  return raw
}

export type ModuleNotificationVisual = {
  slug: ModuleSlug
  label: string
  icon: LucideIcon
  accent: string
  bgClass: string
}

export function getModuleNotificationVisual(
  slug: ModuleSlug
): ModuleNotificationVisual {
  const moduleDef = MODULE_REGISTRY[slug]
  return {
    slug,
    label: moduleDef.label,
    icon: moduleDef.icon,
    accent: moduleDef.accent,
    bgClass: moduleDef.iconBgClass,
  }
}
