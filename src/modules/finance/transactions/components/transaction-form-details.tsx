"use client"

import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
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
          <Field className="gap-0.5">
            <FieldLabel
              htmlFor="transaction-description"
              className="pl-2 text-sm text-muted-foreground"
            >
              Descripción
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <FileTextIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="transaction-description"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
              />
            </InputGroup>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Field className="gap-0.5">
            <FieldLabel
              htmlFor="transaction-notes"
              className="pl-2 text-sm text-muted-foreground"
            >
              Notas
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <NotebookPenIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="transaction-notes"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
              />
            </InputGroup>
          </Field>
        )}
      />
    </SummarySection>
  )
}
