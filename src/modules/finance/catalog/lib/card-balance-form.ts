import { z } from "zod"

import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"

function isOptionalMoneyInput(value: string): boolean {
  return value.trim() === "" || parseFinanceMoney(value) !== null
}

export const cardBalanceSchema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z
    .string()
    .trim()
    .min(1, "Saldo obligatorio")
    .refine((value) => parseFinanceMoney(value) !== null, "Saldo inválido"),
  creditLimit: z
    .string()
    .trim()
    .refine(isOptionalMoneyInput, "Límite inválido"),
})

export type CardBalanceFormValues = z.infer<typeof cardBalanceSchema>

/** Una tarjeta de crédito necesita límite cuando la fila tiene algún valor. */
export function cardBalanceSchemaWithLimit(requireCreditLimit: boolean) {
  return cardBalanceSchema.superRefine((values, ctx) => {
    if (requireCreditLimit && values.creditLimit.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "Límite de crédito obligatorio",
        path: ["creditLimit"],
      })
    }
  })
}
