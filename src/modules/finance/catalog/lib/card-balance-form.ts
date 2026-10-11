import { z } from "zod"

export const cardBalanceSchema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z.string().trim().min(1, "Saldo obligatorio"),
  creditLimit: z.string().trim(),
})

export type CardBalanceFormValues = z.infer<typeof cardBalanceSchema>
