import { z } from "zod"

import { isSingleEmoji } from "@/src/shared/lib/single-emoji"

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(80),
  icon: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isSingleEmoji(value),
      "El icono debe ser un emoji"
    ),
  color: z.string().trim().max(20),
  parentId: z.string(),
  type: z.enum(["EXPENSE", "INCOME"]),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
