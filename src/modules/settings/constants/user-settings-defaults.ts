import type { ModuleConfigBySlug } from '@/src/modules/settings/types/module-config.types';
import type { UserPreferences } from '@/src/modules/settings/types/profile.types';

export const MODULE_CATALOG = {
  finance: {
    id: 'cc5b2284-f639-42a5-b9eb-b167840b8788',
    slug: 'finance',
    key: 'fin',
    description: 'Este modulo es el encargado de la gestion de las finanzas del usuario.',
  },
  agenda: {
    id: 'a2ec64aa-d8ee-4f3e-a526-da69a6e97b58',
    slug: 'agenda',
    key: 'agn',
    description: 'Este modulo es el encargado de la gestion de la agenda del usuario.',
  },
  projects: {
    id: 'ecefaede-2f40-4f7e-9d7d-71abd019505e',
    slug: 'projects',
    key: 'prj',
    description: 'Este modulo es el encargado de la gestion de los proyectos del usuario.',
  },
  subscriptions: {
    id: '7677a8ab-f1aa-4c9e-8fff-5ea2caddad9c',
    slug: 'subscriptions',
    key: 'sub',
    description: 'Este modulo es el encargado de la gestion de las suscripciones del usuario.',
  },
  health: {
    id: 'fd782bbe-51ef-4f09-abd1-5c9885380b47',
    slug: 'health',
    key: 'hlth',
    description: 'Este modulo es el encargado de la gestion de la salud del usuario.',
  },
} as const;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  version: 1,
  theme: {
    fieldGuide: 'Apariencia global (system | light | dark).',
    value: 'system',
  },
  onboarding: {
    fieldGuide: 'Flujo inicial de la app, no de un módulo.',
    completed: false,
  },
  ai: {
    fieldGuide: 'Comportamiento del agente en toda la app.',
    tone: 'balanced',
    proactiveInsights: true,
    confirmBeforeActions: true,
    defaultProvider: null,
  },
  notifications: {
    fieldGuide: 'Cómo el usuario quiere recibir notificaciones.',
    channels: {
      push: true,
      email: false,
      inApp: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: null,
    },
  },
  privacy: {
    fieldGuide: 'Preferencias transversales de telemetría.',
    analyticsEnabled: true,
    crashReportsEnabled: true,
  },
};

export const DEFAULT_MODULE_CONFIG_BY_SLUG: ModuleConfigBySlug = {
  finance: {
    version: 1,
    fieldGuide: 'Moneda, calendario financiero, panel y alertas del módulo Finanzas.',
    baseCurrency: 'DOP',
    weekStartsOn: 1,
    dashboardPeriod: 'month',
    display: {
      showCents: true,
      compactNumbers: false,
    },
    notifications: {
      budgetAlerts: true,
      aiSuggestions: true,
      transactionDetected: true,
      monthlyReport: false,
      cardDueDate: true,
      unusualExpense: true,
    },
    emailSync: {
      enabled: false,
      autoCategorize: true,
    },
  },
  agenda: {
    version: 1,
    fieldGuide: 'Vistas de calendario, horario laboral y recordatorios de eventos.',
    defaultView: 'week',
    weekStartsOn: 1,
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '18:00',
    },
    defaultReminderMinutes: 15,
    notifications: {
      eventReminders: true,
      dailyAgenda: false,
    },
  },
  projects: {
    version: 1,
    fieldGuide: 'Vista y orden por defecto del módulo Proyectos.',
    defaultView: 'board',
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    showArchived: false,
    notifications: {
      dueDateReminders: true,
      statusChanges: false,
    },
  },
  subscriptions: {
    version: 1,
    fieldGuide: 'Moneda, agrupación y avisos de renovación.',
    defaultCurrency: 'DOP',
    renewalReminderDays: [7, 1],
    groupBy: 'category',
    notifications: {
      renewalReminders: true,
      priceIncreaseAlerts: true,
    },
  },
  health: {
    version: 1,
    fieldGuide: 'Unidades, periodo del panel y alertas de metas.',
    units: 'metric',
    dashboardPeriod: 'week',
    privacy: {
      hideSensitiveMetrics: false,
    },
    notifications: {
      goalReminders: true,
      weeklySummary: false,
    },
  },
};
