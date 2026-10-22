"use client"

import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import {
  FileTextIcon,
  InfoIcon,
  LandmarkIcon,
  NotebookPenIcon,
} from "lucide-react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransferDetailsSectionProps = {
  control: Control<TransferFormValues>
  errors: FieldErrors<TransferFormValues>
  destinationPendingId: string
}

export function TransferDetailsSection({
  control,
  errors,
  destinationPendingId,
}: TransferDetailsSectionProps) {
  return (
    <SummarySection title="Detalles opcionales" icon={InfoIcon} collapsible>
      <Controller
        control={control}
        name="destinationPending"
        render={({ field }) => (
          <Field
            orientation="horizontal"
            className="justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
          >
            <FieldLabel
              htmlFor={destinationPendingId}
              className="text-sm font-medium"
            >
              El destino aún no lo recibe
            </FieldLabel>
            <Switch
              id={destinationPendingId}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="feeAmount"
        render={({ field }) => (
          <FormTextField
            label="Comisión (opcional)"
            icon={LandmarkIcon}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.feeAmount?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormTextField
            label="Descripción"
            icon={FileTextIcon}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <FormTextField
            label="Notas"
            icon={NotebookPenIcon}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </SummarySection>
  )
}
