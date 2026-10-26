"use client"

import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { cn } from "@/src/shared/lib/utils"
import type { LucideIcon } from "lucide-react"
import { useId, type ReactNode } from "react"

type SelectFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; mark?: ReactNode }[]
  disabled?: boolean
  icon?: LucideIcon
  error?: string
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  icon: Icon,
  error,
}: SelectFieldProps) {
  const selectId = useId()
  const labelId = useId()

  return (
    <Field className="flex flex-col gap-1">
      {label ? (
        <FieldLabel
          id={labelId}
          htmlFor={selectId}
          className="text-sm text-muted-foreground"
        >
          {label}
        </FieldLabel>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onChange(next ?? "")}
        disabled={disabled}
        items={options.map(({ value, label }) => ({ value, label }))}
        modal={false}
      >
        <SelectTrigger
          className={cn(
            "relative w-full max-w-full cursor-pointer",
            Icon && "pl-9"
          )}
        >
          {Icon ? (
            <Icon className="pointer-events-none absolute left-3 size-4.5 text-muted-foreground" />
          ) : null}
          <SelectValue placeholder={label}>
            {(() => {
              const selected = options.find((item) => item.value === value)
              if (!selected) {
                return null
              }
              return (
                <span className="flex items-center gap-2">
                  {selected.mark}
                  <span className="truncate">{selected.label}</span>
                </span>
              )
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} side="bottom">
          <SelectGroup>
            {label ? <SelectLabel>{label}</SelectLabel> : null}
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <span className="flex items-center gap-2">
                  {item.mark}
                  <span className="truncate">{item.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
