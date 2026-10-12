import { z } from "zod"

import { FINANCE_RECEIVABLE_STATUSES } from "@/src/modules/finance/shared/types/entities"

export const receivableSchema = z.object({
  debtorName: z.string().trim().min(1, "Deudor obligatorio").max(120),
  description: z.string(),
  amount: z.string().trim().min(1, "Monto obligatorio"),
  paidAmount: z.string(),
  status: z.enum(FINANCE_RECEIVABLE_STATUSES),
  currency: z.string().trim().min(3).max(3),
  dueDate: z.string(),
})

export type ReceivableFormValues = z.infer<typeof receivableSchema>
