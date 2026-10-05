"use client"

import type { LoginPayload } from "@/src/modules/auth/types/auth.types";
import { FormTextField } from "@/src/shared/components/layout/form-blocks";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert";
import { FieldGroup } from "@/src/shared/components/ui/field";
import { cn } from "@/src/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
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
    const passwordInputRef = useRef<HTMLInputElement>(null)
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
          isPending ? "opacity-80 pointer-events-none" : "",
          "w-full md:max-w-sm"
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
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    passwordInputRef.current?.focus()
                  }
                }}
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
                revealable
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                inputRef={passwordInputRef}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void submitForm()
                  }
                }}
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
