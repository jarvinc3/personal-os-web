import { z } from "zod"

import {
  isDateTimeInput,
  isLedgerTargetInput,
  isPositiveAmountInput,
} from "@/src/modules/finance/shared/lib/ledger-form"

export const transactionSchema = z.object({
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z
    .string()
    .trim()
    .min(1, "Monto obligatorio")
    .refine(isPositiveAmountInput, "Monto mayor que cero"),
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  transactionDate: z
    .string()
    .trim()
    .refine(isDateTimeInput, "Elige fecha y hora"),
  destination: z
    .string()
    .refine(isLedgerTargetInput, "Elige una cuenta o una tarjeta"),
  categoryId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED"]),
  merchant: z.string().max(200),
  description: z.string(),
  notes: z.string(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
