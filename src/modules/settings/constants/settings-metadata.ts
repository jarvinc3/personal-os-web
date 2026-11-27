import { HELP_ACCENT } from "@/src/modules/help"
import type {
  AIPreferences,
  ThemeValue,
} from "@/src/modules/settings/types/profile.types"
import type { LucideIcon } from "lucide-react"
import {
  Bell,
  BookOpen,
  Bot,
  CalendarRange,
  ChartBarIcon,
  ClockFading,
  Cpu,
  Eraser,
  Globe,
  Image,
  Layers,
  LifeBuoyIcon,
  Mail,
  Monitor,
  Moon,
  Pipette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  SunMoon,
  Trash2,
  User,
  Zap,
} from "lucide-react"

export type SettingsRowIconMeta = {
  icon: LucideIcon
  iconColorClass: string
  iconBgClass: string
}

export type SettingsOptionMeta<T extends string = string> = {
  value: T
  label: string
  description: string
  icon: LucideIcon
}

type SettingsSectionDefinition = {
  accent: string
  rows: Record<string, SettingsRowIconMeta>
}

function createRowMeta(accent: string, icon: LucideIcon): SettingsRowIconMeta {
  return {
    icon,
    iconColorClass: accent,
    iconBgClass: `${accent}/10`,
  }
}

function createSection(
  accent: string,
  rows: Record<string, LucideIcon>
): SettingsSectionDefinition {
  return {
    accent,
    rows: Object.fromEntries(
      Object.entries(rows).map(([key, icon]) => [
        key,
        createRowMeta(accent, icon),
      ])
    ),
  }
}

const themeOptions: SettingsOptionMeta<ThemeValue>[] = [
  {
    value: "system",
    label: "Sistema",
    description: "Sigue la configuración del dispositivo.",
    icon: Monitor,
  },
  {
    value: "light",
    label: "Claro",
    description: "Interfaz clara en todo momento.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Oscuro",
    description: "Interfaz oscura para poca luz.",
    icon: Moon,
  },
]

const aiToneOptions: SettingsOptionMeta<AIPreferences["tone"]>[] = [
  {
    value: "concise",
    label: "Conciso",
    description: "Respuestas breves y directas.",
    icon: Zap,
  },
  {
    value: "balanced",
    label: "Equilibrado",
    description: "Equilibrio entre detalle y brevedad.",
    icon: Bot,
  },
  {
    value: "detailed",
    label: "Detallado",
    description: "Más contexto y explicaciones.",
    icon: BookOpen,
  },
]

export const SETTINGS_REGISTRY = {
  account: createSection("#037cff", {
    fullName: User,
    avatar: Image,
    timeZone: Globe,
    weekStartsOn: CalendarRange,
  }),
  appearance: {
    ...createSection("#F59E0B", {
      theme: SunMoon,
      style: Layers,
      primaryColor: Pipette,
    }),
    themeOptions,
  },
  ai: {
    ...createSection("#dc95fd", {
      tone: Bot,
      defaultProvider: Cpu,
      proactiveInsights: Sparkles,
      confirmBeforeActions: ShieldCheck,
      providerOption: Sparkles,
    }),
    toneOptions: aiToneOptions,
    defaultProviderLabel: "Automático",
  },
  notifications: createSection("#dc95fd", {
    push: Bell,
    email: Mail,
    inApp: Smartphone,
    devicePush: Smartphone,
    quietHoursEnabled: Moon,
    quietHoursSchedule: ClockFading,
  }),
  privacy: createSection("#64748B", {
    analytics: ChartBarIcon,
    crashReports: ShieldCheck,
  }),
  marketing: createSection("#037cff", {
    landingPage: Globe,
  }),
  help: createSection(HELP_ACCENT, {
    center: LifeBuoyIcon,
  }),
  danger: createSection("#EF4444", {
    wipeData: Eraser,
    deleteAccount: Trash2,
  }),
} as const

export function getThemeOptionLabel(value: ThemeValue): string {
  return (
    SETTINGS_REGISTRY.appearance.themeOptions.find(
      (option) => option.value === value
    )?.label ?? value
  )
}

export function getAiToneLabel(value: AIPreferences["tone"]): string {
  return (
    SETTINGS_REGISTRY.ai.toneOptions.find((option) => option.value === value)
      ?.label ?? value
  )
}
