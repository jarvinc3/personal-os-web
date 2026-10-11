import { z } from "zod"

export const agendaModuleSchema = z.object({
  defaultView: z.enum(["day", "week", "month"]),
  weekStartsOn: z.enum(["0", "1"]),
  defaultReminderMinutes: z.number().min(0).max(120),
  workingHoursEnabled: z.boolean(),
  eventReminders: z.boolean(),
  dailyAgenda: z.boolean(),
})

export type AgendaModuleFormValues = z.infer<typeof agendaModuleSchema>
