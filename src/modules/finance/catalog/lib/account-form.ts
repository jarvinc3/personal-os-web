import { z } from "zod"

import {
  CATALOG_NONE,
  FINANCE_ACCOUNT_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"

export const accountSchema = z
  .object({
    name: z.string().trim().min(1, "Nombre obligatorio").max(120),
    type: z.enum(FINANCE_ACCOUNT_TYPES),
    currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
    institutionId: z.string(),
    accountNumber: z.string(),
    color: z.string().trim().max(20),
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
    const digits = values.accountNumber.replace(/\D/g, "")
    if (values.type !== "CASH" && (digits.length < 4 || digits.length > 34)) {
      ctx.addIssue({
        code: "custom",
        path: ["accountNumber"],
        message: "Número de cuenta obligatorio (4 a 34 dígitos)",
      })
    }
  })

export type AccountFormValues = z.infer<typeof accountSchema>
