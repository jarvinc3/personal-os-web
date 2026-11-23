import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import { z } from "zod"

const PAY_DAY_MIN = 1
const PAY_DAY_MAX = 31

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

function validateMonthStartDay(
  values: { monthStartDay: string },
  ctx: z.RefinementCtx
): void {
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
}

function validateCardDueDays(
  values: { cardDueDate: boolean; cardDueDaysBefore: string },
  ctx: z.RefinementCtx
): void {
  if (!values.cardDueDate) {
    return
  }
  const dueDays = Number(values.cardDueDaysBefore)
  if (!Number.isInteger(dueDays) || dueDays < 0 || dueDays > 30) {
    ctx.addIssue({
      code: "custom",
      path: ["cardDueDaysBefore"],
      message: "De 0 a 30 días",
    })
  }
}

function validateSubscriptionDays(
  values: { subscriptionReminderDays: string },
  ctx: z.RefinementCtx
): void {
  const subscriptionDays = Number(values.subscriptionReminderDays)
  if (
    !Number.isInteger(subscriptionDays) ||
    subscriptionDays < 1 ||
    subscriptionDays > 30
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["subscriptionReminderDays"],
      message: "De 1 a 30 días",
    })
  }
}

function validateFixedIncome(
  values: {
    fixedIncomeEnabled: boolean
    fixedIncomeAmount: string
    fixedIncomePayDays: string
  },
  ctx: z.RefinementCtx
): void {
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
    validateMonthStartDay(values, ctx)
    validateCardDueDays(values, ctx)
    validateSubscriptionDays(values, ctx)
    validateFixedIncome(values, ctx)
  })

export type FinanceModuleFormValues = z.infer<typeof financeModuleSchema>

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
