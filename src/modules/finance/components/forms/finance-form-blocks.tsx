"use client"

import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import { Input } from "@/src/shared/components/ui/input"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type SegmentOption<T extends string> = {
  value: T
  label: string
}

type FinanceSegmentedControlProps<T extends string> = {
  label?: string
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  disabled?: boolean
  error?: string
}

export function FinanceSegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
}: FinanceSegmentedControlProps<T>) {
  return (
    <Field data-invalid={error ? true : undefined}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              role="radio"
              aria-checked={selected}
              variant={selected ? "default" : "outline"}
              className={cn("rounded-full", PRESSABLE_CLASS)}
              disabled={disabled}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

type FinanceAmountFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

export function FinanceAmountField({
  label = "Monto",
  value,
  onChange,
  onBlur,
  error,
  placeholder = "0.00",
  disabled,
}: FinanceAmountFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Input
        inputMode="decimal"
        autoComplete="off"
        className="h-14 rounded-2xl px-4 text-3xl font-semibold tabular-nums"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
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
          PRESSABLE_CLASS,
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

export { FormTextField }
