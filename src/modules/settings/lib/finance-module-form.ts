import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import { z } from "zod"

const scheduleTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const PAY_DAY_MIN = 1
const PAY_DAY_MAX = 31

export const EMAIL_SYNC_SCHEDULE_MODES = {
  INTERVAL: "interval",
  TIMES: "times",
} as const

export const MAX_EMAIL_SYNC_TIMES = 8
export const MIN_EMAIL_SYNC_INTERVAL_MINUTES = 15
export const DEFAULT_EMAIL_SYNC_INTERVAL_MINUTES = 360
export const DEFAULT_EMAIL_SYNC_TIMES = ["08:00", "18:00"]

/** Intervalos que ofrece la guía de sincronización al conectar el correo. */
export const EMAIL_SYNC_INTERVAL_PRESETS = [15, 60, 360] as const

export type EmailSyncScheduleConfig =
  FinanceModuleConfig["emailSync"]["schedule"]

export type EmailSyncConfigLike = Pick<
  FinanceModuleConfig["emailSync"],
  "automatic" | "mode" | "schedule"
>

/** Días de pago separados por coma o espacio, sin repetir y en orden. */
export function parsePayDays(value: string): number[] {
  return [
    ...new Set(
      value
        .split(/[,\s]+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => Number(part))
        .filter(
          (day) =>
            Number.isInteger(day) && day >= PAY_DAY_MIN && day <= PAY_DAY_MAX
        )
    ),
  ].sort((left, right) => left - right)
}

export function formatSyncIntervalLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const leftover = minutes % 60
  if (leftover === 0) {
    return `${hours} h`
  }
  return `${hours} h ${leftover} min`
}

export function parseSyncIntervalMinutes(value: string): number {
  const minutes = Number(value)
  if (!Number.isInteger(minutes) || minutes < MIN_EMAIL_SYNC_INTERVAL_MINUTES) {
    return DEFAULT_EMAIL_SYNC_INTERVAL_MINUTES
  }
  return minutes
}

export function nextEmailSyncTime(existing: string[]): string {
  const taken = new Set(existing)
  const last = existing.at(-1) ?? DEFAULT_EMAIL_SYNC_TIMES[0]
  const [hoursText, minutesText = "00"] = last.split(":")
  let hour = Number(hoursText)
  for (let step = 0; step < 24; step += 1) {
    hour = (hour + 1) % 24
    const candidate = `${String(hour).padStart(2, "0")}:${minutesText}`
    if (!taken.has(candidate)) {
      return candidate
    }
  }
  return DEFAULT_EMAIL_SYNC_TIMES[0]
}

export function emailSyncTimesFromSchedule(
  schedule: EmailSyncScheduleConfig
): string[] {
  if (schedule.mode === "times" && schedule.times.length > 0) {
    return schedule.times
  }
  return [...DEFAULT_EMAIL_SYNC_TIMES]
}

/** El paso automático ya quedó resuelto cuando `automatic` está encendido. */
export function isEmailSyncConfigured(
  config: Pick<EmailSyncConfigLike, "automatic">
): boolean {
  return config.automatic
}

export function emailSyncScheduleLabel(
  schedule: EmailSyncScheduleConfig
): string {
  if (schedule.mode === "interval") {
    return `Cada ${formatSyncIntervalLabel(schedule.everyMinutes)}`
  }
  return `A las ${schedule.times.join(", ")}`
}

/** Valores propuestos al terminar de conectar Gmail: encender lo automático. */
export function emailSyncOnboardingDefaults(
  config: EmailSyncConfigLike
): Pick<
  FinanceModuleFormValues,
  | "emailSyncAutomatic"
  | "emailSyncMode"
  | "emailSyncScheduleMode"
  | "emailSyncEveryMinutes"
  | "emailSyncTimes"
> {
  return {
    emailSyncAutomatic: true,
    emailSyncMode: config.mode,
    emailSyncScheduleMode: config.schedule.mode,
    emailSyncEveryMinutes:
      config.schedule.mode === "interval"
        ? String(config.schedule.everyMinutes)
        : String(DEFAULT_EMAIL_SYNC_INTERVAL_MINUTES),
    emailSyncTimes: emailSyncTimesFromSchedule(config.schedule),
  }
}

function hasInvalidPayDay(value: string): boolean {
  return value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => {
      const day = Number(part)
      return !Number.isInteger(day) || day < PAY_DAY_MIN || day > PAY_DAY_MAX
    })
}

export const financeModuleSchema = z
  .object({
    weekStartsOn: z.enum(["0", "1"]),
    dashboardPeriod: z.enum(["week", "month", "year"]),
    showCents: z.boolean(),
    compactNumbers: z.boolean(),
    amountEntry: z.enum(["keyboard", "calculator"]),
    defaultAccountId: z.string(),
    monthStartDay: z.string(),
    cardDueDaysBefore: z.string(),
    fixedIncomeEnabled: z.boolean(),
    fixedIncomeAmount: z.string(),
    fixedIncomeFrequency: z.enum(["BIWEEKLY", "MONTHLY"]),
    fixedIncomePayDays: z.string(),
    fixedIncomeAccountId: z.string(),
    emailSyncEnabled: z.boolean(),
    emailSyncAutomatic: z.boolean(),
    emailSyncMode: z.enum(["DIRECT", "PENDING"]),
    emailSyncScheduleMode: z.enum([
      EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
      EMAIL_SYNC_SCHEDULE_MODES.TIMES,
    ]),
    emailSyncEveryMinutes: z.string(),
    emailSyncTimes: z.array(z.string()),
    autoCategorize: z.boolean(),
    budgetAlerts: z.boolean(),
    aiSuggestions: z.boolean(),
    transactionDetected: z.boolean(),
    monthlyReport: z.boolean(),
    weeklySummary: z.boolean(),
    weeklySummaryDay: z.enum(["0", "1", "2", "3", "4", "5", "6"]),
    cardDueDate: z.boolean(),
    unusualExpense: z.boolean(),
    recurringAlerts: z.boolean(),
    subscriptionReminders: z.boolean(),
    priceIncreaseAlerts: z.boolean(),
    balanceIntegrity: z.boolean(),
    subscriptionReminderDays: z.string(),
    subscriptionGroupBy: z.enum(["category", "provider", "none"]),
  })
  .superRefine((values, ctx) => {
    if (values.emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL) {
      const minutes = Number(values.emailSyncEveryMinutes)
      if (
        !Number.isInteger(minutes) ||
        minutes < MIN_EMAIL_SYNC_INTERVAL_MINUTES
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["emailSyncEveryMinutes"],
          message: "Mínimo 15 minutos",
        })
      }
    } else {
      const times = values.emailSyncTimes
        .map((time) => time.trim())
        .filter(Boolean)
      if (times.length === 0 || times.length > MAX_EMAIL_SYNC_TIMES) {
        ctx.addIssue({
          code: "custom",
          path: ["emailSyncTimes"],
          message: "Pon de 1 a 8 horas",
        })
      } else if (times.some((time) => !scheduleTimePattern.test(time))) {
        ctx.addIssue({
          code: "custom",
          path: ["emailSyncTimes"],
          message: "Hora no válida",
        })
      } else if (new Set(times).size !== times.length) {
        ctx.addIssue({
          code: "custom",
          path: ["emailSyncTimes"],
          message: "No repitas horas",
        })
      }
    }

    const monthStartDay = Number(values.monthStartDay)
    if (
      !Number.isInteger(monthStartDay) ||
      monthStartDay < 1 ||
      monthStartDay > 28
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["monthStartDay"],
        message: "Del 1 al 28",
      })
    }

    const dueDays = Number(values.cardDueDaysBefore)
    if (!Number.isInteger(dueDays) || dueDays < 0 || dueDays > 30) {
      ctx.addIssue({
        code: "custom",
        path: ["cardDueDaysBefore"],
        message: "De 0 a 30 días",
      })
    }

    const subscriptionDays = Number(values.subscriptionReminderDays)
    if (
      !Number.isInteger(subscriptionDays) ||
      subscriptionDays < 0 ||
      subscriptionDays > 30
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["subscriptionReminderDays"],
        message: "De 0 a 30 días",
      })
    }

    if (!values.fixedIncomeEnabled) {
      return
    }
    const amount = Number(values.fixedIncomeAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["fixedIncomeAmount"],
        message: "Monto mayor que 0",
      })
    }
    if (hasInvalidPayDay(values.fixedIncomePayDays)) {
      ctx.addIssue({
        code: "custom",
        path: ["fixedIncomePayDays"],
        message: "Días del 1 al 31",
      })
    } else if (parsePayDays(values.fixedIncomePayDays).length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["fixedIncomePayDays"],
        message: "Pon al menos un día de pago",
      })
    }
  })

export type FinanceModuleFormValues = z.infer<typeof financeModuleSchema>

/** Bloque `emailSync` del parche de configuración a partir del formulario. */
export function emailSyncPatchFromFormValues(
  values: FinanceModuleFormValues
): FinanceModuleConfig["emailSync"] {
  return {
    enabled: values.emailSyncEnabled,
    automatic: values.emailSyncAutomatic,
    autoCategorize: values.autoCategorize,
    mode: values.emailSyncMode,
    schedule:
      values.emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL
        ? {
            mode: EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
            everyMinutes: Number(values.emailSyncEveryMinutes),
          }
        : {
            mode: EMAIL_SYNC_SCHEDULE_MODES.TIMES,
            times: values.emailSyncTimes
              .map((time) => time.trim())
              .filter(Boolean),
          },
  }
}

/** Bloque `subscriptions` del parche de configuración. */
export function subscriptionsPatchFromFormValues(
  values: FinanceModuleFormValues
): FinanceModuleConfig["subscriptions"] {
  return {
    reminderDaysBefore: Number(values.subscriptionReminderDays),
    groupBy: values.subscriptionGroupBy,
  }
}

/** Valores del formulario de Ajustes a partir de la configuración guardada. */
export function configToFinanceFormValues(
  config: FinanceModuleConfig
): FinanceModuleFormValues {
  return {
    weekStartsOn: String(config.weekStartsOn) as "0" | "1",
    dashboardPeriod: config.dashboardPeriod,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    amountEntry: config.amountEntry,
    defaultAccountId: config.defaultAccountId ?? "",
    monthStartDay: String(config.monthStartDay),
    cardDueDaysBefore: String(config.reminders.cardDueDaysBefore),
    fixedIncomeEnabled: config.fixedIncome.enabled,
    fixedIncomeAmount:
      config.fixedIncome.amount > 0 ? String(config.fixedIncome.amount) : "",
    fixedIncomeFrequency: config.fixedIncome.frequency,
    fixedIncomePayDays: config.fixedIncome.payDays.join(", "),
    fixedIncomeAccountId: config.fixedIncome.accountId ?? "",
    emailSyncMode: config.emailSync.mode,
    emailSyncEnabled: config.emailSync.enabled,
    emailSyncAutomatic: config.emailSync.automatic,
    emailSyncScheduleMode: config.emailSync.schedule.mode,
    emailSyncEveryMinutes:
      config.emailSync.schedule.mode === "interval"
        ? String(config.emailSync.schedule.everyMinutes)
        : String(DEFAULT_EMAIL_SYNC_INTERVAL_MINUTES),
    emailSyncTimes: emailSyncTimesFromSchedule(config.emailSync.schedule),
    autoCategorize: config.emailSync.autoCategorize,
    budgetAlerts: config.notifications.budgetAlerts,
    aiSuggestions: config.notifications.aiSuggestions,
    transactionDetected: config.notifications.transactionDetected,
    monthlyReport: config.notifications.monthlyReport,
    weeklySummary: config.notifications.weeklySummary,
    weeklySummaryDay: String(config.reports.weeklySummaryDay) as
      "0" | "1" | "2" | "3" | "4" | "5" | "6",
    cardDueDate: config.notifications.cardDueDate,
    unusualExpense: config.notifications.unusualExpense,
    recurringAlerts: config.notifications.recurringAlerts,
    subscriptionReminders: config.notifications.subscriptionReminders,
    priceIncreaseAlerts: config.notifications.priceIncreaseAlerts,
    balanceIntegrity: config.notifications.balanceIntegrity,
    subscriptionReminderDays: String(config.subscriptions.reminderDaysBefore),
    subscriptionGroupBy: config.subscriptions.groupBy,
  }
}
