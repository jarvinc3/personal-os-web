import { z } from "zod"

export const subscriptionsModuleSchema = z.object({
  defaultCurrency: z.string().trim().min(3),
  groupBy: z.enum(["category", "provider", "none"]),
  renewalReminders: z.boolean(),
  priceIncreaseAlerts: z.boolean(),
})

export type SubscriptionsModuleFormValues = z.infer<
  typeof subscriptionsModuleSchema
>
