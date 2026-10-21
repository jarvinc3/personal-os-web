"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import type { TransactionFormValues } from "@/src/modules/finance/transactions/lib/transaction-form"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransactionDateStatusFieldProps = {
  control: Control<TransactionFormValues>
  errors: FieldErrors<TransactionFormValues>
  paidLabel: string
  statusSwitchId: string
  locked: boolean
}

export function TransactionDateStatusField({
  control,
  errors,
  paidLabel,
  statusSwitchId,
  locked,
}: TransactionDateStatusFieldProps) {
  return (
    <Controller
      control={control}
      name="transactionDate"
      render={({ field }) => (
        <FinanceDateField
          label="Fecha y hora"
          value={field.value}
          onChange={field.onChange}
          error={errors.transactionDate?.message}
          withTime
          disabled={locked}
          aside={
            <Controller
              control={control}
              name="status"
              render={({ field: statusField }) => (
                <Field
                  orientation="horizontal"
                  className="h-11 w-auto shrink-0 gap-2 rounded-xl border border-border bg-card px-3"
                >
                  <FieldLabel
                    htmlFor={statusSwitchId}
                    className="text-sm font-medium"
                  >
                    {paidLabel}
                  </FieldLabel>
                  <Switch
                    id={statusSwitchId}
                    checked={statusField.value === "CONFIRMED"}
                    onCheckedChange={(checked) =>
                      statusField.onChange(checked ? "CONFIRMED" : "PENDING")
                    }
                    disabled={locked}
                  />
                </Field>
              )}
            />
          }
        />
      )}
    />
  )
}
