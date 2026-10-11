import { z } from "zod"

export const healthModuleSchema = z.object({
  units: z.enum(["metric", "imperial"]),
  dashboardPeriod: z.enum(["week", "month", "year"]),
  hideSensitiveMetrics: z.boolean(),
  goalReminders: z.boolean(),
  weeklySummary: z.boolean(),
})

export type HealthModuleFormValues = z.infer<typeof healthModuleSchema>
