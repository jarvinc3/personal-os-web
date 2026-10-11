import { z } from "zod"

export const assignEmailMessageSchema = z.object({
  target: z.string().min(1, "Elige una cuenta o una tarjeta"),
})

export type AssignEmailMessageFormValues = z.infer<
  typeof assignEmailMessageSchema
>
