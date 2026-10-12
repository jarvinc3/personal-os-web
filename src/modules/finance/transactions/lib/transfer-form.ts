import { z } from "zod"

import {
  isLedgerTargetInput,
  isDateTimeInput,
  isPositiveAmountInput,
} from "@/src/modules/finance/shared/lib/ledger-form"

export const TRANSFER_RAILS = ["SAME_BANK", "ACH", "LBTR", "OTHER"] as const
export type TransferRail = (typeof TRANSFER_RAILS)[number]

export const TRANSFER_RAIL_LABEL: Record<TransferRail, string> = {
  SAME_BANK: "Mismo banco",
  ACH: "ACH (día laborable)",
  LBTR: "LBTR (al instante)",
  OTHER: "Otro",
}

export const transferSchema = z
  .object({
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
    fromTarget: z
      .string()
      .refine(isLedgerTargetInput, "Elige una cuenta de origen"),
    toTarget: z.string().refine(isLedgerTargetInput, "Elige destino"),
    status: z.enum(["PENDING", "CONFIRMED"]),
    rail: z.union([z.literal(""), z.enum(TRANSFER_RAILS)]),
    feeAmount: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || isPositiveAmountInput(value),
        "Monto de comisión inválido"
      ),
    description: z.string(),
    notes: z.string(),
  })
  .refine((values) => values.fromTarget !== values.toTarget, {
    path: ["toTarget"],
    message: "Origen y destino tienen que ser distintos",
  })

export type TransferFormValues = z.infer<typeof transferSchema>
