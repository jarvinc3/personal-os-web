import type { ModuleSlug } from "@/src/shared/types/module-nav"

export type { ModuleSlug }

/** keepAwake is a module without user settings, so it has no stored config. */
export type ConfigurableModuleSlug = Exclude<ModuleSlug, "keepAwake">

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
  }
  reports: {
    /** 0 = domingo … 6 = sábado, en la zona horaria del usuario. */
    weeklySummaryDay: number
  }
  emailSync: {
    enabled: boolean
    automatic: boolean
    autoCategorize: boolean
    /** DIRECT confirma lo importado; PENDING lo deja por confirmar. */
    mode: "DIRECT" | "PENDING"
    schedule:
      | { mode: "interval"; everyMinutes: number }
      | { mode: "times"; times: string[] }
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

export type SubscriptionsModuleConfig = {
  version: number
  fieldGuide: string
  defaultCurrency: string
  renewalReminderDays: number[]
  groupBy: "category" | "provider" | "none"
  notifications: {
    renewalReminders: boolean
    priceIncreaseAlerts: boolean
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

export type ModuleConfigBySlug = {
  finance: FinanceModuleConfig
  agenda: AgendaModuleConfig
  projects: ProjectsModuleConfig
  subscriptions: SubscriptionsModuleConfig
  health: HealthModuleConfig
}

export type ModuleConfig<
  S extends ConfigurableModuleSlug = ConfigurableModuleSlug,
> = ModuleConfigBySlug[S]

export type UserModuleEntry = {
  slug: ModuleSlug
  isEnabled: boolean
  config: ModuleConfig
  enabledAt: string
}

export type DeepPartialModuleConfig<S extends ConfigurableModuleSlug> = {
  [K in keyof ModuleConfig<S>]?: ModuleConfig<S>[K] extends object
    ? Partial<ModuleConfig<S>[K]>
    : ModuleConfig<S>[K]
}
