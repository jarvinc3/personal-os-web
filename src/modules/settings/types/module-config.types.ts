import type { ModuleSlug } from "@/src/shared/types/module-nav"

export type { ModuleSlug }

/** keepAwake is a module without user settings, so it has no stored config. */
export type ConfigurableModuleSlug = Exclude<ModuleSlug, "keepAwake">
/** `ai` tiene configuración propia, pero no representa una app navegable. */
export type ModuleConfigSlug = ConfigurableModuleSlug | "ai"

export type FinanceModuleConfig = {
  version: number
  fieldGuide: string
  baseCurrency: string
  trackedCurrencies: string[]
  weekStartsOn: 0 | 1
  dashboardPeriod: "week" | "month" | "year"
  display: {
    showCents: boolean
    compactNumbers: boolean
  }
  /** Entrada de monto con la que abren los formularios de Finanzas. */
  amountEntry: "keyboard" | "calculator"
  /** Ingreso fijo del usuario; sugerencia para una nómina sin monto. */
  fixedIncome: {
    enabled: boolean
    amount: number
    frequency: "BIWEEKLY" | "MONTHLY"
    payDays: number[]
    accountId: string | null
  }
  /** Cuenta que se propone primero en gastos y transferencias. */
  defaultAccountId: string | null
  /** Día del mes en que arranca el mes financiero (1-28). */
  monthStartDay: number
  reminders: {
    /** Días antes del vencimiento de la tarjeta para avisar. */
    cardDueDaysBefore: number
  }
  notifications: {
    budgetAlerts: boolean
    aiSuggestions: boolean
    transactionDetected: boolean
    monthlyReport: boolean
    weeklySummary: boolean
    cardDueDate: boolean
    unusualExpense: boolean
    recurringAlerts: boolean
    subscriptionReminders: boolean
    priceIncreaseAlerts: boolean
    balanceIntegrity: boolean
  }
  /** Ajustes del gestor de suscripciones, dentro de Finanzas. */
  subscriptions: {
    /** Días antes de la renovación para el recordatorio (0-30). */
    reminderDaysBefore: number
    groupBy: "category" | "provider" | "none"
  }
  reports: {
    /** 0 = domingo … 6 = sábado, en la zona horaria del usuario. */
    weeklySummaryDay: number
  }
}

export type AgendaModuleConfig = {
  version: number
  fieldGuide: string
  defaultView: "day" | "week" | "month"
  weekStartsOn: 0 | 1
  workingHours: {
    enabled: boolean
    start: string
    end: string
  }
  defaultReminderMinutes: number
  notifications: {
    eventReminders: boolean
    dailyAgenda: boolean
  }
}

export type ProjectsModuleConfig = {
  version: number
  fieldGuide: string
  defaultView: "board" | "list" | "timeline"
  sortBy: string
  sortDirection: "asc" | "desc"
  showArchived: boolean
  notifications: {
    dueDateReminders: boolean
    statusChanges: boolean
  }
}

export type HealthModuleConfig = {
  version: number
  fieldGuide: string
  units: "metric" | "imperial"
  dashboardPeriod: "week" | "month" | "year"
  privacy: {
    hideSensitiveMetrics: boolean
  }
  notifications: {
    goalReminders: boolean
    weeklySummary: boolean
  }
}

export type AiModuleConfig = {
  version: number
  fieldGuide: string
  email: {
    reviewConfidenceThreshold: number
    acceptVerifiedSenders: boolean
  }
}

export type ModuleConfigBySlug = {
  finance: FinanceModuleConfig
  agenda: AgendaModuleConfig
  projects: ProjectsModuleConfig
  health: HealthModuleConfig
  ai: AiModuleConfig
}

export type ModuleConfig<S extends ModuleConfigSlug = ModuleConfigSlug> =
  ModuleConfigBySlug[S]

export type UserModuleEntry = {
  slug: ModuleSlug | "ai"
  isEnabled: boolean
  config: ModuleConfig
  enabledAt: string
}

export type DeepPartialModuleConfig<S extends ModuleConfigSlug> = {
  [K in keyof ModuleConfig<S>]?: ModuleConfig<S>[K] extends object
    ? Partial<ModuleConfig<S>[K]>
    : ModuleConfig<S>[K]
}
