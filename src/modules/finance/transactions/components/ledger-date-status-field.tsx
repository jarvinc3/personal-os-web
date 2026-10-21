"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"

export type LedgerStatus = "PENDING" | "CONFIRMED"

type LedgerDateStatusFieldProps = {
  date: {
    value: string
    error?: string
    disabled?: boolean
    onChange: (value: string) => void
  }
  status: {
    value: LedgerStatus
    label: string
    switchId: string
    disabled?: boolean
    onChange: (value: LedgerStatus) => void
  }
}

/**
 * Date and completion switch shared by the movement and transfer forms. Each
 * form keeps its own controllers; only the markup is shared.
 */
export function LedgerDateStatusField({
  date,
  status,
}: LedgerDateStatusFieldProps) {
  return (
    <FinanceDateField
      label="Fecha y hora"
      value={date.value}
      onChange={date.onChange}
      error={date.error}
      withTime
      disabled={date.disabled}
      aside={
        <Field
          orientation="horizontal"
          className="h-11 w-auto shrink-0 gap-2 rounded-xl border border-border bg-card px-3"
        >
          <FieldLabel htmlFor={status.switchId} className="text-sm font-medium">
            {status.label}
          </FieldLabel>
          <Switch
            id={status.switchId}
            checked={status.value === "CONFIRMED"}
            onCheckedChange={(checked) =>
              status.onChange(checked ? "CONFIRMED" : "PENDING")
            }
            disabled={status.disabled}
          />
        </Field>
      }
    />
  )
}
