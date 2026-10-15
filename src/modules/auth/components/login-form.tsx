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
import { AlertCircleIcon, LockIcon, MailIcon } from "lucide-react"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/src/modules/auth/lib/login-form"

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
    } = useForm<LoginFormValues>({
      resolver: zodResolver(loginFormSchema),
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
          "w-full md:max-w-sm"
        )}
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
                placeholder=""
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
                icon={LockIcon}
                label="Contraseña"
                type="password"
                revealable
                autoComplete="current-password"
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
