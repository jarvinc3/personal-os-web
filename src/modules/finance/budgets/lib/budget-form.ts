import { z } from "zod"

import { FINANCE_BUDGET_PERIODS } from "@/src/modules/finance/shared/types/entities"

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Elige una categoría"),
  periodType: z.enum(FINANCE_BUDGET_PERIODS),
  periodStart: z.string().trim().min(1, "Inicio obligatorio"),
  periodEnd: z.string().trim().min(1, "Fin obligatorio"),
  amountLimit: z.string().trim().min(1, "Tope obligatorio"),
  alertThresholdPct: z.string().trim().min(1, "Umbral obligatorio"),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
