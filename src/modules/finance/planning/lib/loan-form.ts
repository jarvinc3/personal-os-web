import { z } from "zod"

import { FINANCE_INSTALLMENT_FREQS } from "@/src/modules/finance/shared/types/entities"

export const loanSchema = z.object({
  lenderName: z.string().trim().min(1, "Prestamista obligatorio").max(120),
  institutionId: z.string(),
  accountId: z.string(),
  originalAmount: z.string().trim().min(1, "Monto original obligatorio"),
  currentBalance: z.string().trim().min(1, "Saldo obligatorio"),
  installmentAmount: z.string().trim().min(1, "Cuota obligatoria"),
  installmentFreq: z.enum(FINANCE_INSTALLMENT_FREQS),
  totalInstallments: z.string().trim().min(1, "Cuotas totales obligatorias"),
  paidInstallments: z.string(),
  nextDueDate: z.string().trim().min(1, "Próximo vencimiento obligatorio"),
  interestRatePercent: z.string(),
  notes: z.string().max(500),
  currency: z.string().trim().min(3).max(3),
})

export type LoanFormValues = z.infer<typeof loanSchema>
