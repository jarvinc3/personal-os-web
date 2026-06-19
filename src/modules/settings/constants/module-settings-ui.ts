import {
  AGENDA_ROW_ICONS,
  FINANCE_ROW_ICONS,
  HEALTH_ROW_ICONS,
  MODULE_ACCENTS,
  PROJECTS_ROW_ICONS,
  SUBSCRIPTIONS_ROW_ICONS,
  type SettingsRowIconMeta,
} from '@/src/modules/settings/constants/settings-metadata';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import type { LucideIcon } from 'lucide-react';

export const MODULE_SLUGS_ORDER: ModuleSlug[] = [
  'finance',
  'agenda',
  'projects',
  'subscriptions',
  'health',
];

export const MODULE_SETTINGS_UI: Record<ModuleSlug, SettingsRowIconMeta & { label: string }> = {
  finance: {
    label: 'Finanzas',
    ...FINANCE_ROW_ICONS.defaultView,
  },
  agenda: {
    label: 'Agenda',
    ...AGENDA_ROW_ICONS.defaultView,
  },
  projects: {
    label: 'Proyectos',
    ...PROJECTS_ROW_ICONS.defaultView,
  },
  subscriptions: {
    label: 'Suscripciones',
    ...SUBSCRIPTIONS_ROW_ICONS.defaultView,
  },
  health: {
    label: 'Salud',
    ...HEALTH_ROW_ICONS.units,
  },
};

const MODULE_SLUG_SET = new Set<string>(MODULE_SLUGS_ORDER);

export function isModuleSlug(value: string): value is ModuleSlug {
  return MODULE_SLUG_SET.has(value);
}

export function parseModuleSlugFromNotificationData(
  data: Record<string, unknown> | null | undefined,
): ModuleSlug | null {
  const raw = data?.moduleSlug;
  if (typeof raw !== 'string' || !isModuleSlug(raw)) {
    return null;
  }
  return raw;
}

export type ModuleNotificationVisual = {
  slug: ModuleSlug;
  label: string;
  icon: LucideIcon;
  accent: string;
  bgClass: string;
};

/** Icono y color de módulo (SSOT: `MODULE_SETTINGS_UI` + `MODULE_ACCENTS`). */
export function getModuleNotificationVisual(slug: ModuleSlug): ModuleNotificationVisual {
  const ui = MODULE_SETTINGS_UI[slug];
  return {
    slug,
    label: ui.label,
    icon: ui.icon,
    accent: MODULE_ACCENTS[slug],
    bgClass: ui.iconBgClass,
  };
}
