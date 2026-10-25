"use client"

import { sanitizeAmountInput } from "@/src/modules/finance/shared/lib/money"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/src/shared/components/ui/input-group"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { CheckIcon, SparklesIcon } from "lucide-react"
import type { ReactNode, Ref } from "react"

type FinanceAmountInputProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  /** Botón que se coloca dentro del campo, al final. */
  trailing?: ReactNode
  /** Narrow currency symbol drawn before the amount, e.g. `$`. */
  prefix?: string | null
  onReadOnlyActivate?: () => void
  inputRef?: Ref<HTMLInputElement>
}

export function FinanceAmountInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "0.00",
  disabled,
  readOnly = false,
  trailing,
  prefix,
  onReadOnlyActivate,
  inputRef,
}: FinanceAmountInputProps) {
  const symbol = prefix?.trim() || null

  return (
    <InputGroup className="h-14 rounded-2xl">
      {symbol ? (
        <InputGroupAddon align="inline-start" className="pl-4">
          <InputGroupText className="text-3xl font-semibold tabular-nums">
            {symbol}
          </InputGroupText>
        </InputGroupAddon>
      ) : null}
      <InputGroupInput
        inputMode={readOnly ? "none" : "decimal"}
        autoComplete="off"
        readOnly={readOnly}
        ref={inputRef}
        className={cn(
          "px-4 text-3xl font-semibold tabular-nums",
          readOnly && "cursor-pointer"
        )}
        value={value}
        onChange={(event) => onChange(sanitizeAmountInput(event.target.value))}
        onBlur={onBlur}
        onClick={readOnly ? onReadOnlyActivate : undefined}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
      />
      {trailing ? (
        <InputGroupAddon align="inline-end">{trailing}</InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

type FinanceHelpTextProps = {
  children: ReactNode
}

export function FinanceHelpText({ children }: FinanceHelpTextProps) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

type FinanceSuggestionRowProps = {
  children: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function FinanceSuggestionRow({
  children,
  actionLabel,
  onAction,
}: FinanceSuggestionRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-success/10 px-3 py-2 text-sm">
      <SparklesIcon className="size-4 shrink-0 text-success" />
      <span className="min-w-0 flex-1">{children}</span>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-success"
          onClick={onAction}
        >
          <CheckIcon className="size-4 shrink-0" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
