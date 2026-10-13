import type { ModuleConfigBySlug } from "@/src/modules/settings/types/module-config.types"
import type { UserPreferences } from "@/src/modules/settings/types/profile.types"

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  version: 1,
  theme: {
    fieldGuide: "Apariencia global (system | light | dark).",
    value: "system",
  },
  onboarding: {
    fieldGuide: "Flujo inicial de la app, no de un módulo.",
    completed: false,
  },
  ai: {
    fieldGuide: "Comportamiento del agente en toda la app.",
    tone: "balanced",
    proactiveInsights: true,
    confirmBeforeActions: true,
    defaultProvider: null,
  },
  notifications: {
    fieldGuide: "Cómo el usuario quiere recibir notificaciones.",
    channels: {
      push: true,
      email: false,
      inApp: true,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
      timezone: null,
    },
  },
  privacy: {
    fieldGuide: "Preferencias transversales de telemetría.",
    analyticsEnabled: true,
    crashReportsEnabled: true,
  },
}

export const DEFAULT_MODULE_CONFIG_BY_SLUG: ModuleConfigBySlug = {
  finance: {
    version: 1,
    fieldGuide:
      "Moneda, calendario financiero, panel y alertas del módulo Finanzas.",
    baseCurrency: "DOP",
    trackedCurrencies: ["USD", "EUR"],
    weekStartsOn: 1,
    dashboardPeriod: "month",
    display: {
      showCents: true,
      compactNumbers: false,
    },
    amountEntry: "keyboard",
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
      automatic: false,
      autoCategorize: true,
      schedule: { mode: "interval", everyMinutes: 360 },
    },
  },
  agenda: {
    version: 1,
    fieldGuide:
      "Vistas de calendario, horario laboral y recordatorios de eventos.",
    defaultView: "week",
    weekStartsOn: 1,
    workingHours: {
      enabled: true,
      start: "09:00",
      end: "18:00",
    },
    defaultReminderMinutes: 15,
    notifications: {
      eventReminders: true,
      dailyAgenda: false,
    },
  },
  projects: {
    version: 1,
    fieldGuide: "Vista y orden por defecto del módulo Proyectos.",
    defaultView: "board",
    sortBy: "updatedAt",
    sortDirection: "desc",
    showArchived: false,
    notifications: {
      dueDateReminders: true,
      statusChanges: false,
    },
  },
  subscriptions: {
    version: 1,
    fieldGuide: "Moneda, agrupación y avisos de renovación.",
    defaultCurrency: "DOP",
    renewalReminderDays: [7, 1],
    groupBy: "category",
    notifications: {
      renewalReminders: true,
      priceIncreaseAlerts: true,
    },
  },
  health: {
    version: 1,
    fieldGuide: "Unidades, periodo del panel y alertas de metas.",
    units: "metric",
    dashboardPeriod: "week",
    privacy: {
      hideSensitiveMetrics: false,
    },
    notifications: {
      goalReminders: true,
      weeklySummary: false,
    },
  },
}
