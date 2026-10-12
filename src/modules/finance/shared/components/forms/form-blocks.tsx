"use client"

import { sanitizeAmountInput } from "@/src/modules/finance/shared/lib/money"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/src/shared/components/ui/input-group"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, SparklesIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/** El preset del proyecto no trae un estado pulsado con el color primario. */
const SEGMENT_PRESSED_CLASS =
  "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/80"

type SegmentOption<T extends string> = {
  value: T
  label: string
  icon?: LucideIcon
}

type FinanceSegmentedControlProps<T extends string> = {
  label?: string
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  disabled?: boolean
  error?: string
  size?: "sm" | "lg"
  fullWidth?: boolean
}

export function FinanceSegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  size = "sm",
  fullWidth = false,
}: FinanceSegmentedControlProps<T>) {
  return (
    <Field data-invalid={error ? true : undefined} className="gap-1">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <ToggleGroup
        value={[value]}
        onValueChange={(next) => {
          const selected = options.find((option) => option.value === next[0])
          if (!selected) {
            return
          }
          onChange(selected.value)
        }}
        variant="outline"
        size={size === "lg" ? "lg" : "sm"}
        aria-label={label}
        disabled={disabled}
        className={cn(fullWidth && "w-full")}
      >
        {options.map((option) => {
          const OptionIcon = option.icon
          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className={cn(
                "rounded-full",
                SEGMENT_PRESSED_CLASS,
                fullWidth && "h-11 flex-1 text-base"
              )}
            >
              {OptionIcon ? <OptionIcon /> : null}
              {option.label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

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

type FinanceDetailsDisclosureProps = {
  title?: string
  children: ReactNode
  defaultOpen?: boolean
}

export function FinanceDetailsDisclosure({
  title = "Detalles opcionales",
  children,
  defaultOpen = false,
}: FinanceDetailsDisclosureProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger
        className={cn(
          "group/details flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-sm font-medium text-muted-foreground",
          PRESSABLE_CLASS
        )}
      >
        {title}
        <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-200 group-aria-expanded/details:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-3 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

type FinanceHelpTextProps = {
  children: ReactNode
}

export function FinanceHelpText({ children }: FinanceHelpTextProps) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

type FinancePreviewRowProps = {
  icon?: LucideIcon
  title: string
  description?: string
  accentColor?: string
}

export function FinancePreviewRow({
  icon: Icon,
  title,
  description,
  accentColor,
}: FinancePreviewRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/40 px-3 py-2.5">
      {Icon ? (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
          style={
            accentColor
              ? {
                  backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
                }
              : undefined
          }
        >
          <Icon
            className="size-4"
            style={accentColor ? { color: accentColor } : undefined}
          />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        {description ? (
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </div>
  )
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
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
