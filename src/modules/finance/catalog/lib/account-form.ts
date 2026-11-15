import { z } from "zod"

import {
  CATALOG_NONE,
  FINANCE_ACCOUNT_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"

const ACCOUNT_NUMBER_REQUIRED = "Número de cuenta obligatorio (4 a 34 dígitos)"
const ACCOUNT_NUMBER_DIGITS = "Número de cuenta: 4 a 34 dígitos"

/**
 * On edit the number is optional: empty keeps the stored one, because the API
 * never returns the full number (only `accountNumberLast4`).
 */
export function accountSchemaFor(options: {
  isEdit: boolean
  /** El paso a paso de propuestas admite solo los últimos 4 dígitos. */
  allowLastFourOnly?: boolean
}) {
  return z
    .object({
      name: z.string().trim().min(1, "Nombre obligatorio").max(120),
      type: z.enum(FINANCE_ACCOUNT_TYPES),
      currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
      institutionId: z.string(),
      accountNumber: z.string(),
      color: z.string().trim().max(20),
      initialBalance: z.string(),
      isDefaultForInstitution: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (
        values.type !== "CASH" &&
        (!values.institutionId || values.institutionId === CATALOG_NONE)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["institutionId"],
          message: "La cuenta necesita una institución",
        })
      }
      if (values.type === "CASH") {
        return
      }
      const digits = values.accountNumber.replace(/\D/g, "")
      if (digits.length === 0) {
        if (!options.isEdit && !options.allowLastFourOnly) {
          ctx.addIssue({
            code: "custom",
            path: ["accountNumber"],
            message: ACCOUNT_NUMBER_REQUIRED,
          })
        }
        return
      }
      if (digits.length < 4 || digits.length > 34) {
        ctx.addIssue({
          code: "custom",
          path: ["accountNumber"],
          message: ACCOUNT_NUMBER_DIGITS,
        })
      }
    })
}

export type AccountFormValues = z.infer<ReturnType<typeof accountSchemaFor>>
