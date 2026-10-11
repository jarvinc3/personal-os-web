import { z } from "zod"

export const editAccountSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre es obligatorio"),
})

export type EditAccountFormValues = z.infer<typeof editAccountSchema>
