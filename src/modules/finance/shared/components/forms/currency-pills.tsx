"use client"

import { buildFinanceCurrencyOptions } from "@/src/modules/finance/shared/lib/finance-currency"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"

type FinanceCurrencyPillsProps = {
  value: string
  onChange: (value: string) => void
  baseCurrency: string
  extraCodes?: string[]
  excludeCodes?: string[]
  disabled?: boolean
  label?: string
  error?: string
}

export function FinanceCurrencyPills({
  value,
  onChange,
  baseCurrency,
  extraCodes = [],
  excludeCodes = [],
  disabled,
  label = "Moneda",
  error,
}: FinanceCurrencyPillsProps) {
  const excluded = new Set(
    excludeCodes.map((code) => code.trim().toUpperCase()).filter(Boolean)
  )
  const current = value.trim().toUpperCase()
  const { config } = useFinanceEnabled()
  const options = buildFinanceCurrencyOptions(
    baseCurrency,
    config.trackedCurrencies,
    [...extraCodes, value]
  ).filter((code) => code === current || !excluded.has(code))

  return (
    <Field data-invalid={error ? true : undefined}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label ?? "Moneda"}
        aria-disabled={disabled || undefined}
      >
        {options.map((code) => {
          const selected = current === code
          return (
            <Button
              key={code}
              type="button"
              size="sm"
              role="radio"
              aria-checked={selected}
              variant={selected ? "default" : "outline"}
              className={cn("min-w-14 rounded-full", PRESSABLE_CLASS)}
              disabled={disabled}
              onClick={() => onChange(code)}
            >
              {code}
            </Button>
          )
        })}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
