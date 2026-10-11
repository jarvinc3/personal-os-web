import { z } from "zod"

import { FINANCE_INSTITUTION_TYPES } from "@/src/modules/finance/shared/constants/catalog"

export const institutionSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  color: z.string().trim().max(20),
  country: z.string().trim().max(2),
  type: z.enum(FINANCE_INSTITUTION_TYPES),
  shortName: z.string().trim().max(40),
  sortOrder: z.string().trim().max(4),
  domain: z.string().trim().max(253),
})

export type InstitutionFormValues = z.infer<typeof institutionSchema>
