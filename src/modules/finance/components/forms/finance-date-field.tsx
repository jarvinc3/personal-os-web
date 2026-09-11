"use client"

import { todayDateInput } from "@/src/modules/finance/lib/ledger-form"
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
import { DateWheels } from "@/src/shared/components/ui/wheel-picker"
import { parseDate } from "@/src/shared/types/wheels.type"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { useState } from "react"

type FinanceDateFieldProps = {
  label: string
  value: string
  onChange: (next: string) => void
  error?: string
  optional?: boolean
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

export function formatFinanceDateLabel(value: string): string {
  const parsed = parseDate(value)
  if (!parsed) return "Elegir fecha"
  const date = new Date(
    Number(parsed.year),
    Number(parsed.month) - 1,
    Number(parsed.day),
  )
  if (Number.isNaN(date.getTime())) return "Elegir fecha"
  return date.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function FinanceDateField({
  label,
  value,
  onChange,
  error,
  optional = false,
  disabled = false,
  minYear,
  maxYear,
}: FinanceDateFieldProps) {
  const hasValue = Boolean(parseDate(value))
  const [open, setOpen] = useState(!hasValue && !optional)

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel>{label}</FieldLabel>
      <Collapsible open={open} onOpenChange={setOpen} disabled={disabled}>
        <CollapsibleTrigger
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left",
            PRESSABLE_CLASS,
            disabled && "opacity-50",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 text-sm font-medium">
            {hasValue ? formatFinanceDateLabel(value) : optional ? "Sin fecha" : "Elegir fecha"}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <DateWheels
            value={hasValue ? value : todayDateInput()}
            onChange={onChange}
            disabled={disabled}
            minYear={minYear}
            maxYear={maxYear}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={PRESSABLE_CLASS}
              disabled={disabled}
              onClick={() => {
                onChange(todayDateInput())
                setOpen(false)
              }}
            >
              Hoy
            </Button>
            {optional ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={PRESSABLE_CLASS}
                disabled={disabled}
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                Sin fecha
              </Button>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
