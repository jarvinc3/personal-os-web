import type { FinanceModuleConfig, ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import type { AIPreferences, ThemeValue } from '@/src/modules/settings/types/profile.types';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BadgeDollarSignIcon,
  BarChart3,
  BarChart3Icon,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusinessIcon,
  Calendar,
  CalendarDays,
  ChartBarIcon,
  Clock,
  ClockFading,
  Cpu,
  CreditCard,
  FileText,
  Globe,
  Image,
  Languages,
  Mail,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  User,
  Wallet,
  Zap,
} from 'lucide-react';

// --- Types ---

export type SettingsRowIconMeta = {
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
};

export type SettingsOptionMeta<T extends string = string> = {
  value: T;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type FinanceNotificationKey = keyof FinanceModuleConfig['notifications'];

export type FinanceNotificationRowMeta = {
  key: FinanceNotificationKey;
  label: string;
} & SettingsRowIconMeta;

// --- Helpers ---

export function createSettingsIconMeta(accent: string, icon: LucideIcon): SettingsRowIconMeta {
  return {
    icon,
    iconColorClass: accent,
    iconBgClass: `${accent}/10`,
  };
}

export function createModuleIconMeta(slug: ModuleSlug, icon: LucideIcon): SettingsRowIconMeta {
  return createSettingsIconMeta(MODULE_ACCENTS[slug], icon);
}

function createSectionIcons<T extends Record<string, LucideIcon>>(
  accent: string,
  icons: T
): { [K in keyof T]: SettingsRowIconMeta } {
  return Object.fromEntries(
    Object.entries(icons).map(([key, icon]) => [key, createSettingsIconMeta(accent, icon)])
  ) as { [K in keyof T]: SettingsRowIconMeta };
}

// --- Accents (SSOT para filas y sheets) ---

export const SETTINGS_SECTION_ACCENTS = {
  account: '#037cff',
  locale: '#8B5CF6',
  appearance: '#F59E0B',
  ai: '#dc95fd',
  notifications: '#dc95fd',
  privacy: '#64748B',
  danger: '#EF4444',
} as const;

export const MODULE_ACCENTS: Record<ModuleSlug, string> = {
  finance: '#10B981',
  agenda: '#3B82F6',
  projects: '#8B5CF6',
  subscriptions: '#F97316',
  health: '#EF4444',
};

// --- Cuenta y locale ---

export const ACCOUNT_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.account, {
  fullName: User,
  avatar: Image,
});

export const LOCALE_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.locale, {
  timezone: Globe,
  locale: Languages,
});

// --- Apariencia ---

export const APPEARANCE_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.appearance, {
  theme: Palette,
});

export const THEME_OPTION_ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} satisfies Record<ThemeValue, LucideIcon>;

export const THEME_OPTIONS: SettingsOptionMeta<ThemeValue>[] = [
  {
    value: 'system',
    label: 'Sistema',
    description: 'Sigue la configuración del dispositivo.',
    icon: THEME_OPTION_ICONS.system,
  },
  {
    value: 'light',
    label: 'Claro',
    description: 'Interfaz clara en todo momento.',
    icon: THEME_OPTION_ICONS.light,
  },
  {
    value: 'dark',
    label: 'Oscuro',
    description: 'Interfaz oscura para poca luz.',
    icon: THEME_OPTION_ICONS.dark,
  },
];

export const THEME_OPTION_LABELS = Object.fromEntries(
  THEME_OPTIONS.map((option) => [option.value, option.label])
) as Record<ThemeValue, string>;

// --- IA ---

export const AI_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.ai, {
  tone: Bot,
  defaultProvider: Cpu,
  proactiveInsights: Sparkles,
  confirmBeforeActions: ShieldCheck,
});

export const AI_TONE_OPTION_META = {
  concise: { icon: Zap, description: 'Respuestas breves y directas.' },
  balanced: { icon: Bot, description: 'Equilibrio entre detalle y brevedad.' },
  detailed: { icon: BookOpen, description: 'Más contexto y explicaciones.' },
} as const satisfies Record<AIPreferences['tone'], { icon: LucideIcon; description: string }>;

export const AI_TONE_OPTIONS: SettingsOptionMeta<AIPreferences['tone']>[] = [
  { value: 'concise', label: 'Conciso', ...AI_TONE_OPTION_META.concise },
  { value: 'balanced', label: 'Equilibrado', ...AI_TONE_OPTION_META.balanced },
  { value: 'detailed', label: 'Detallado', ...AI_TONE_OPTION_META.detailed },
];

export const AI_TONE_LABELS = Object.fromEntries(
  AI_TONE_OPTIONS.map((option) => [option.value, option.label])
) as Record<AIPreferences['tone'], string>;

export const AI_DEFAULT_PROVIDER_LABEL = 'Automático';

export const AI_PROVIDER_SHEET_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.ai, {
  automatic: Sparkles,
  provider: Sparkles,
});

// --- Notificaciones globales ---

export const NOTIFICATION_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.notifications, {
  push: Bell,
  email: Mail,
  inApp: Smartphone,
  devicePush: Smartphone,
});

export const QUIET_HOURS_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.notifications, {
  enabled: Moon,
  schedule: ClockFading,
});

// --- Privacidad ---

export const PRIVACY_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.privacy, {
  analytics: ChartBarIcon,
  crashReports: ShieldCheck,
});

export const DANGER_ROW_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.danger, {
  deleteAccount: Trash2,
});

// --- Módulos: iconos por campo ---

export const FINANCE_ROW_ICONS = createSectionIcons(MODULE_ACCENTS.finance, {
  defaultView: BarChart3Icon,
  baseCurrency: Wallet,
  weekStartsOn: Calendar,
  dashboardPeriod: BarChart3,
});

export const AGENDA_ROW_ICONS = createSectionIcons(MODULE_ACCENTS.agenda, {
  defaultView: Calendar,
  weekStartsOn: CalendarDays,
  reminder: Bell,
});

export const PROJECTS_ROW_ICONS = createSectionIcons(MODULE_ACCENTS.projects, {
  defaultView: BriefcaseBusinessIcon,
  sort: BarChart3,
  archived: ShieldCheck,
});

export const SUBSCRIPTIONS_ROW_ICONS = createSectionIcons(MODULE_ACCENTS.subscriptions, {
  defaultView: Wallet,
  currency: BadgeDollarSignIcon,
  groupBy: BarChart3,
});

export const HEALTH_ROW_ICONS = createSectionIcons(MODULE_ACCENTS.health, {
  units: BarChart3,
  period: Calendar,
  privacy: ShieldCheck,
});

// --- Finanzas: alertas del módulo (keys alineadas a `FinanceModuleConfig.notifications`) ---

export const FINANCE_NOTIFICATION_ROWS: FinanceNotificationRowMeta[] = [
  {
    key: 'budgetAlerts',
    label: 'Alertas de presupuesto',
    ...createModuleIconMeta('finance', Wallet),
  },
  {
    key: 'aiSuggestions',
    label: 'Sugerencias de IA',
    ...createModuleIconMeta('finance', Sparkles),
  },
  {
    key: 'transactionDetected',
    label: 'Transacciones detectadas',
    ...createModuleIconMeta('finance', Bell),
  },
  {
    key: 'monthlyReport',
    label: 'Reporte mensual',
    ...createModuleIconMeta('finance', FileText),
  },
  {
    key: 'cardDueDate',
    label: 'Vencimiento de tarjetas',
    ...createModuleIconMeta('finance', CreditCard),
  },
  {
    key: 'unusualExpense',
    label: 'Gastos inusuales',
    ...createModuleIconMeta('finance', AlertTriangle),
  },
];

// --- Horario silencioso (sheet) ---

export const QUIET_HOURS_SHEET_ICONS = createSectionIcons(SETTINGS_SECTION_ACCENTS.notifications, {
  field: Clock,
});
