"use client"

import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import type { TransactionFormValues } from "@/src/modules/finance/transactions/lib/transaction-form"
import { FileTextIcon, InfoIcon, NotebookPenIcon } from "lucide-react"
import { Controller, type Control } from "react-hook-form"

type TransactionDetailsSectionProps = {
  control: Control<TransactionFormValues>
  openByDefault: boolean
}

export function TransactionDetailsSection({
  control,
  openByDefault,
}: TransactionDetailsSectionProps) {
  return (
    <SummarySection
      title="Detalles opcionales"
      icon={InfoIcon}
      collapsible
      defaultOpen={openByDefault}
    >
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
