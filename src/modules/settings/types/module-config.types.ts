import type { ModuleSlug } from "@/src/shared/types/module-nav"

export type { ModuleSlug }

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
  notifications: {
    budgetAlerts: boolean
    aiSuggestions: boolean
    transactionDetected: boolean
    monthlyReport: boolean
    cardDueDate: boolean
    unusualExpense: boolean
  }
  emailSync: {
    enabled: boolean
    automatic: boolean
    autoCategorize: boolean
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

export type ModuleConfig<S extends ModuleSlug = ModuleSlug> =
  ModuleConfigBySlug[S]

export type UserModuleEntry = {
  slug: ModuleSlug
  isEnabled: boolean
  config: ModuleConfig
  enabledAt: string
}

export type DeepPartialModuleConfig<S extends ModuleSlug> = {
  [K in keyof ModuleConfig<S>]?: ModuleConfig<S>[K] extends object
    ? Partial<ModuleConfig<S>[K]>
    : ModuleConfig<S>[K]
}
