"use client"

import { isAuthFormLocked } from "@/src/modules/auth/lib/auth-form-gate"
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/src/modules/auth/lib/login-form"
import type { LoginPayload } from "@/src/modules/auth/types/auth.types"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { FieldGroup } from "@/src/shared/components/ui/field"
import { useHydrated } from "@/src/shared/hooks/use-hydrated"
import { cn } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, LockIcon, MailIcon } from "lucide-react"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

type LoginFormProps = {
  formId: string
  isPending: boolean
  error: Error | null
  onSubmit: (payload: LoginPayload) => Promise<void>
}

export function LoginForm({
  formId,
  isPending,
  error,
  onSubmit,
}: LoginFormProps) {
  const hydrated = useHydrated()
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  })

  const isLocked = isAuthFormLocked({ hydrated, isPending })

  const submitForm = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch {
      // Error shown via mutation error prop
    }
  })

  return (
    <div
      className={cn(
        isPending ? "pointer-events-none opacity-80" : "",
        "w-full md:max-w-sm"
      )}
    >
      <form
        id={formId}
        noValidate
        aria-busy={isLocked || undefined}
        onSubmit={(event) => {
          event.preventDefault()
          void submitForm()
        }}
      >
        <FieldGroup className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormTextField
                icon={MailIcon}
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                placeholder="example@example.com"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    passwordInputRef.current?.focus()
                  }
                }}
                disabled={isLocked}
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
                autoComplete="current-password"
                placeholder="********"
                inputRef={passwordInputRef}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isLocked}
                error={errors.password?.message}
                invalid={Boolean(errors.password)}
              />
            )}
          />
        </FieldGroup>
      </form>
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
