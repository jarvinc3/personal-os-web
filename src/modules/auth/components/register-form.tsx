"use client"

import type { RegisterPayload } from "@/src/modules/auth/types/auth.types"
import {
  PASSWORD_MIN_LENGTH,
  passwordPolicySchema,
} from "@/src/modules/auth/lib/password-policy"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { FieldGroup } from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, LockIcon, MailIcon, UserIcon } from "lucide-react"
import { forwardRef, useImperativeHandle } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ingresa tu nombre completo"),
    email: z.string().trim().email("Ingresa un email válido"),
    password: passwordPolicySchema,
    confirmPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "Confirma tu contraseña"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type RegisterSchema = z.infer<typeof registerSchema>

export type RegisterFormHandle = {
  submit: () => void
}

type RegisterFormProps = {
  isPending: boolean
  error: Error | null
  onSubmit: (payload: RegisterPayload) => Promise<void>
}

export const RegisterForm = forwardRef<RegisterFormHandle, RegisterFormProps>(
  function RegisterForm({ isPending, error, onSubmit }, ref) {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<RegisterSchema>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    })

    const submitForm = handleSubmit(async (values) => {
      try {
        await onSubmit({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        })
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
          "w-full md:max-w-sm"
        )}
      >
        <FieldGroup className="gap-4">
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <FormTextField
                icon={UserIcon}
                label="Nombre completo"
                autoComplete="name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                error={errors.fullName?.message}
                invalid={Boolean(errors.fullName)}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormTextField
                icon={MailIcon}
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
                icon={LockIcon}
                label="Contraseña"
                type="password"
                revealable
                autoComplete="new-password"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                error={errors.password?.message}
                invalid={Boolean(errors.password)}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormTextField
                icon={LockIcon}
                label="Confirmar contraseña"
                type="password"
                revealable
                autoComplete="new-password"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isPending}
                error={errors.confirmPassword?.message}
                invalid={Boolean(errors.confirmPassword)}
              />
            )}
          />
        </FieldGroup>
        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon />
            <AlertTitle>Error de registro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    )
  }
)
