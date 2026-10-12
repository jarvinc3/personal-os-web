import { z } from "zod"

export const savingsGoalSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  description: z.string().max(500),
  targetAmount: z.string().trim().min(1, "Meta obligatoria"),
  accountId: z.string().trim().min(1, "Cuenta obligatoria"),
  mode: z.enum(["EARMARK", "DEDICATED"]),
  currentAmount: z.string(),
  currency: z.string().trim().min(3).max(3),
  targetDate: z.string(),
})

export type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>
