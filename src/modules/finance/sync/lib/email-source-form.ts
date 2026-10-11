import { z } from "zod"

export const emailSourceSchema = z.object({
  institutionId: z.string().min(1, "Elige una institución"),
  bankSenderEmail: z
    .string()
    .trim()
    .email("Correo de notificaciones inválido")
    .max(150),
  extraSenders: z.string().max(800),
  label: z.string().max(120),
})

export type EmailSourceFormValues = z.infer<typeof emailSourceSchema>
