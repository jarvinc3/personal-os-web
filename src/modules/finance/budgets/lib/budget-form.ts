import { z } from "zod"

import {
  FINANCE_BUDGET_PERIODS,
  FINANCE_BUDGET_ROLLOVERS,
} from "@/src/modules/finance/shared/types/entities"

export const budgetSchema = z.object({
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "Elige al menos una categoría"),
  periodType: z.enum(FINANCE_BUDGET_PERIODS),
  periodStart: z.string().trim().min(1, "Inicio obligatorio"),
  periodEnd: z.string().trim().min(1, "Fin obligatorio"),
  amountLimit: z.string().trim().min(1, "Tope obligatorio"),
  alertThresholdPct: z.string().trim().min(1, "Umbral obligatorio"),
  includeChildren: z.boolean(),
  rollover: z.enum(FINANCE_BUDGET_ROLLOVERS),
  recurring: z.boolean(),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
