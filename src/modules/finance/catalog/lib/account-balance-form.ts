import { z } from "zod"

import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"

export const accountBalanceSchema = z.object({
  balance: z
    .string()
    .trim()
    .min(1, "Saldo obligatorio")
    .refine((value) => parseFinanceMoney(value) !== null, "Saldo inválido"),
})

export type AccountBalanceFormValues = z.infer<typeof accountBalanceSchema>
