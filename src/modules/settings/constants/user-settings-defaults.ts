import type { ModuleConfigBySlug } from "@/src/modules/settings/types/module-config.types"
import type { UserPreferences } from "@/src/modules/settings/types/profile.types"
import {
  DEFAULT_APPEARANCE_STYLE,
  DEFAULT_PRIMARY_COLOR,
} from "@/src/shared/appearance"

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  version: 2,
  theme: {
    fieldGuide: "Apariencia global: claro, oscuro o el del sistema.",
    value: "system",
    style: DEFAULT_APPEARANCE_STYLE,
    primaryColor: DEFAULT_PRIMARY_COLOR,
  },
  onboarding: {
    fieldGuide: "Flujo inicial de Personal OS, no de una app.",
    completed: false,
  },
  regional: {
    weekStartsOn: null,
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
    version: 2,
    fieldGuide:
      "Moneda, calendario financiero, panel y alertas de la app Finanzas.",
    baseCurrency: "DOP",
    trackedCurrencies: ["USD", "EUR"],
    weekStartsOn: 1,
    dashboardPeriod: "month",
    display: {
      showCents: true,
      compactNumbers: false,
    },
    amountEntry: "keyboard",
    fixedIncome: {
      enabled: false,
      amount: 0,
      frequency: "MONTHLY",
      payDays: [],
      accountId: null,
    },
    defaultAccountId: null,
    monthStartDay: 1,
    reminders: {
      cardDueDaysBefore: 3,
    },
    notifications: {
      budgetAlerts: true,
      aiSuggestions: true,
      transactionDetected: true,
      monthlyReport: false,
      weeklySummary: true,
      cardDueDate: true,
      unusualExpense: true,
      recurringAlerts: true,
      subscriptionReminders: true,
      priceIncreaseAlerts: true,
      balanceIntegrity: true,
    },
    subscriptions: {
      reminderDaysBefore: 5,
      groupBy: "none",
    },
    reports: {
      weeklySummaryDay: 1,
    },
    emailSync: {
      enabled: false,
      automatic: false,
      autoCategorize: true,
      mode: "DIRECT",
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
    fieldGuide: "Vista y orden por defecto de la app Proyectos.",
    defaultView: "board",
    sortBy: "updatedAt",
    sortDirection: "desc",
    showArchived: false,
    notifications: {
      dueDateReminders: true,
      statusChanges: false,
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
