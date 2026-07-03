"use client"

import type { LoginPayload } from "@/src/modules/auth/types/auth.types"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { FieldGroup } from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon } from "lucide-react"
import { forwardRef, useImperativeHandle } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayuscula")
    .regex(/[0-9]/, "Debe incluir al menos un numero"),
})

type LoginSchema = z.infer<typeof loginSchema>

export type LoginFormHandle = {
  submit: () => void
}

type LoginFormProps = {
  isPending: boolean
  error: Error | null
  onSubmit: (payload: LoginPayload) => Promise<void>
}

export const LoginForm = forwardRef<LoginFormHandle, LoginFormProps>(
  function LoginForm({ isPending, error, onSubmit }, ref) {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<LoginSchema>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: "", password: "" },
    })

    const submitForm = handleSubmit(async (values) => {
      try {
        await onSubmit(values)
      } catch {
        // Error shown via mutation error prop
      }
    })

    useImperativeHandle(ref, () => ({
      submit: () => void submitForm(),
    }))

    return (
      <div
        className={cn(
          isPending ? "pointer-events-none opacity-80" : "",
          "w-full max-w-sm"
        )}
      >
        <FieldGroup className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormTextField
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                error={errors.email?.message}
                invalid={Boolean(errors.email)}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormTextField
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                error={errors.password?.message}
                invalid={Boolean(errors.password)}
              />
            )}
          />
        </FieldGroup>
        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon />
            <AlertTitle>Error de autenticación</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    )
  }
)
