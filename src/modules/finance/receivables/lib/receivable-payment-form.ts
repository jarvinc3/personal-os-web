import { z } from "zod"

export const receivablePaymentSchema = z.object({
  amount: z.string().trim().min(1, "Monto obligatorio"),
  accountId: z.string().trim().min(1, "Cuenta obligatoria"),
  paidAt: z.string(),
})

export type ReceivablePaymentFormValues = z.infer<
  typeof receivablePaymentSchema
>
