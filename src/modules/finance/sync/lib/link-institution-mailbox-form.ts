import { z } from "zod"

export const linkInstitutionMailboxSchema = z.object({
  mailboxId: z.string().min(1, "Elige un correo"),
  institutionId: z.string().min(1, "Elige una institución"),
  bankSenderEmail: z
    .string()
    .trim()
    .email("Correo de notificaciones inválido")
    .max(150),
  label: z.string().max(120),
})

export type LinkInstitutionMailboxFormValues = z.infer<
  typeof linkInstitutionMailboxSchema
>
