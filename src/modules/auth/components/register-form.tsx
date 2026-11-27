"use client"

import { isAuthFormLocked } from "@/src/modules/auth/lib/auth-form-gate"
import {
  PASSWORD_MIN_LENGTH,
  passwordPolicySchema,
} from "@/src/modules/auth/lib/password-policy"
import type { RegisterPayload } from "@/src/modules/auth/types/auth.types"
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
import {
  AlertCircleIcon,
  Eye,
  EyeOff,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react"
import { useId, useState } from "react"
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

type RegisterFormProps = {
  formId: string
  isPending: boolean
  error: Error | null
  onSubmit: (payload: RegisterPayload) => Promise<void>
}

export function RegisterForm({
  formId,
  isPending,
  error,
  onSubmit,
}: RegisterFormProps) {
  const hydrated = useHydrated()
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

  const isLocked = isAuthFormLocked({ hydrated, isPending })
  const fullNameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()
  const [passwordRevealed, setPasswordRevealed] = useState(false)
  const [confirmRevealed, setConfirmRevealed] = useState(false)

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
            name="fullName"
            render={({ field }) => (
              <Field
                data-invalid={errors.fullName ? true : undefined}
                data-disabled={isLocked ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor={fullNameId}
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Nombre completo
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <UserIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={fullNameId}
                    autoComplete="name"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    disabled={isLocked}
                    aria-invalid={errors.fullName ? true : undefined}
                  />
                </InputGroup>
                {errors.fullName?.message ? (
                  <FieldError>{errors.fullName.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

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
                    placeholder="tu@email.com"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
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
                    id={passwordId}
                    type={passwordRevealed ? "text" : "password"}
                    autoComplete="new-password"
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Field
                data-invalid={errors.confirmPassword ? true : undefined}
                data-disabled={isLocked ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor={confirmPasswordId}
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Confirmar contraseña
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <LockIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={confirmPasswordId}
                    type={confirmRevealed ? "text" : "password"}
                    autoComplete="new-password"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    disabled={isLocked}
                    aria-invalid={errors.confirmPassword ? true : undefined}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        confirmRevealed
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={confirmRevealed}
                      disabled={isLocked}
                      onClick={() => setConfirmRevealed((current) => !current)}
                    >
                      {confirmRevealed ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {errors.confirmPassword?.message ? (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
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
