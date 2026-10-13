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
    cardDueDate: z.boolean(),
    unusualExpense: z.boolean(),
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
