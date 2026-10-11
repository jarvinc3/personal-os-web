import { z } from "zod"

export const loginFormSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
