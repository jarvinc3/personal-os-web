import { z } from "zod"

export const savingsGoalContributionSchema = z.object({
  amount: z.string().trim().min(1, "Monto obligatorio"),
  contributedAt: z.string(),
  notes: z.string().max(200),
})

export type SavingsGoalContributionFormValues = z.infer<
  typeof savingsGoalContributionSchema
>
