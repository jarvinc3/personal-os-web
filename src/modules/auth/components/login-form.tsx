"use client"

import { isAuthFormLocked } from "@/src/modules/auth/lib/auth-form-gate"
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/src/modules/auth/lib/login-form"
import type { LoginPayload } from "@/src/modules/auth/types/auth.types"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { useHydrated } from "@/src/shared/hooks/use-hydrated"
import { cn } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, Eye, EyeOff, LockIcon, MailIcon } from "lucide-react"
import { useId, useRef, useState } from "react"
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
  const emailId = useId()
  const passwordId = useId()
  const [passwordRevealed, setPasswordRevealed] = useState(false)
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
              <Field
                data-invalid={errors.email ? true : undefined}
                data-disabled={isLocked ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor={emailId}
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Correo electrónico
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <MailIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    placeholder="example@example.com"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        passwordInputRef.current?.focus()
                      }
                    }}
                    disabled={isLocked}
                    aria-invalid={errors.email ? true : undefined}
                  />
                </InputGroup>
                {errors.email?.message ? (
                  <FieldError>{errors.email.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Field
                data-invalid={errors.password ? true : undefined}
                data-disabled={isLocked ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor={passwordId}
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Contraseña
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <LockIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={passwordInputRef}
                    id={passwordId}
                    type={passwordRevealed ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="********"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    disabled={isLocked}
                    aria-invalid={errors.password ? true : undefined}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        passwordRevealed
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={passwordRevealed}
                      disabled={isLocked}
                      onClick={() => setPasswordRevealed((current) => !current)}
                    >
                      {passwordRevealed ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {errors.password?.message ? (
                  <FieldError>{errors.password.message}</FieldError>
                ) : null}
              </Field>
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
