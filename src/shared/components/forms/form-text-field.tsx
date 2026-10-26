"use client"

import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { cn } from "@/src/shared/lib/utils"
import { Eye, EyeOff, KeyRound, type LucideIcon } from "lucide-react"
import {
  useId,
  useState,
  type HTMLInputTypeAttribute,
  type KeyboardEventHandler,
  type Ref,
} from "react"

type FormTextFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  placeholder?: string
  disabled?: boolean
  error?: string
  invalid?: boolean
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  ariaLabel?: string
  icon?: LucideIcon
  inputRef?: Ref<HTMLInputElement>
  revealable?: boolean
  maxLength?: number
  className?: string
}

export function FormTextField({
  label,
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  disabled,
  error,
  invalid,
  type = "text",
  autoComplete,
  ariaLabel,
  icon: Icon,
  inputRef,
  revealable = false,
  maxLength,
  className,
}: FormTextFieldProps) {
  const fieldId = useId()
  const hasError = invalid ?? Boolean(error)
  const FieldIcon = Icon ?? (type === "password" ? KeyRound : undefined)
  const [revealed, setRevealed] = useState(false)
  const canReveal = revealable && type === "password"
  const inputType = canReveal && revealed ? "text" : type

  return (
    <Field
      data-invalid={hasError ? true : undefined}
      data-disabled={disabled ? true : undefined}
      className="gap-1"
    >
      {label ? (
        <FieldLabel htmlFor={fieldId} className="text-sm text-muted-foreground">
          {label}
        </FieldLabel>
      ) : null}
      <InputGroup className={cn("h-10 overflow-hidden", className)}>
        {FieldIcon ? (
          <InputGroupAddon align="inline-start">
            <FieldIcon className="text-muted-foreground" />
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          ref={inputRef}
          id={fieldId}
          type={inputType}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-invalid={hasError || undefined}
        />
        {canReveal ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={
                revealed ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={revealed}
              disabled={disabled}
              onClick={() => setRevealed((current) => !current)}
            >
              {revealed ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
