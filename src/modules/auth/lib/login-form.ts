import { z } from "zod"

import { passwordPolicySchema } from "@/src/modules/auth/lib/password-policy"

export const loginFormSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido"),
  password: passwordPolicySchema,
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
