import { z } from "zod"

export const accountBalanceSchema = z.object({
  balance: z.string().trim().min(1, "Saldo obligatorio"),
})

export type AccountBalanceFormValues = z.infer<typeof accountBalanceSchema>
