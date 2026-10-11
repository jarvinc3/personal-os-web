import { z } from "zod"

const scheduleTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export const EMAIL_SYNC_SCHEDULE_MODES = {
  INTERVAL: "interval",
  TIMES: "times",
} as const

export const MAX_EMAIL_SYNC_TIMES = 8
export const MIN_EMAIL_SYNC_INTERVAL_MINUTES = 15

export const financeModuleSchema = z
  .object({
    weekStartsOn: z.enum(["0", "1"]),
    dashboardPeriod: z.enum(["week", "month", "year"]),
    showCents: z.boolean(),
    compactNumbers: z.boolean(),
    emailSyncEnabled: z.boolean(),
    emailSyncAutomatic: z.boolean(),
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
      return
    }
    const times = values.emailSyncTimes
      .map((time) => time.trim())
      .filter(Boolean)
    if (times.length === 0 || times.length > MAX_EMAIL_SYNC_TIMES) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "Pon de 1 a 8 horas",
      })
      return
    }
    if (times.some((time) => !scheduleTimePattern.test(time))) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "Hora no válida",
      })
      return
    }
    if (new Set(times).size !== times.length) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "No repitas horas",
      })
    }
  })

export type FinanceModuleFormValues = z.infer<typeof financeModuleSchema>
