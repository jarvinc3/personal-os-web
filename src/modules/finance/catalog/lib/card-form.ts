import { z } from "zod"

import { FINANCE_CARD_TYPES } from "@/src/modules/finance/shared/constants/catalog"

const balanceRowSchema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z.string().trim(),
  creditLimit: z.string().trim(),
})

export const cardSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  type: z.enum(FINANCE_CARD_TYPES),
  institutionId: z.string().min(1, "Institución obligatoria"),
  accountId: z.string(),
  network: z.string(),
  lastFour: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Deben ser 4 dígitos"),
  statementClosingDay: z.string().trim(),
  paymentDueDay: z.string().trim(),
  color: z.string().trim().max(20),
  balances: z.array(balanceRowSchema),
})

export type CardFormValues = z.infer<typeof cardSchema>
