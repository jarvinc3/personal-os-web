"use client"

import { useCurrencies } from "@/src/modules/finance/hooks/use-currencies"
import { SelectField } from "@/src/shared/components/layout/form-blocks"
import { useMemo } from "react"

type CurrencySelectFieldProps = {
  value: string
  onChange: (value: string) => void
  enabled: boolean
  extraCodes?: string[]
  disabled?: boolean
  label?: string
}

export function CurrencySelectField({
  value,
  onChange,
  enabled,
  extraCodes = [],
  disabled,
  label,
}: CurrencySelectFieldProps) {
  const query = useCurrencies(enabled)
  const options = useMemo(() => {
    const codes = new Set<string>()
    for (const code of query.data ?? []) {
      codes.add(code)
    }
    for (const code of extraCodes) {
      if (code) codes.add(code)
    }
    if (value) codes.add(value)
    return [...codes].sort().map((code) => ({ value: code, label: code }))
  }, [query.data, extraCodes, value])

  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={
        options.length > 0
          ? options
          : [{ value: value || "DOP", label: value || "DOP" }]
      }
      disabled={disabled || (query.isPending && options.length === 0)}
    />
  )
}
