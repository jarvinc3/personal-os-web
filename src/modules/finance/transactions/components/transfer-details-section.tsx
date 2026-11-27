"use client"

import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { SummarySection } from "@/src/shared/components/data-display/summary"
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
          <Field
            data-invalid={errors.feeAmount ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="transfer-fee"
              className="pl-2 text-sm text-muted-foreground"
            >
              Comisión (opcional)
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <LandmarkIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="transfer-fee"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                aria-invalid={errors.feeAmount ? true : undefined}
              />
            </InputGroup>
            {errors.feeAmount?.message ? (
              <FieldError>{errors.feeAmount.message}</FieldError>
            ) : null}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Field className="gap-0.5">
            <FieldLabel
              htmlFor="transfer-description"
              className="pl-2 text-sm text-muted-foreground"
            >
              Descripción
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <FileTextIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="transfer-description"
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
              htmlFor="transfer-notes"
              className="pl-2 text-sm text-muted-foreground"
            >
              Notas
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <NotebookPenIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="transfer-notes"
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
