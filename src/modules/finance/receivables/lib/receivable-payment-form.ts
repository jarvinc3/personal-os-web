import { z } from "zod"

import type { FinanceReceivableStatus } from "@/src/modules/finance/shared/types/entities"

const CLOSED_RECEIVABLE_STATUSES: readonly FinanceReceivableStatus[] = [
  "CANCELLED",
  "WRITTEN_OFF",
]

export function canRegisterReceivablePayment(
  status: FinanceReceivableStatus
): boolean {
  return !CLOSED_RECEIVABLE_STATUSES.includes(status)
}

export const receivablePaymentSchema = z.object({
  amount: z.string().trim().min(1, "Monto obligatorio"),
  accountId: z.string().trim().min(1, "Cuenta obligatoria"),
  paidAt: z.string(),
})

export type ReceivablePaymentFormValues = z.infer<
  typeof receivablePaymentSchema
>
