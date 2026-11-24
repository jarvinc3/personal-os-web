"use client"

import {
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_NETWORKS,
  CATALOG_NONE,
} from "@/src/modules/finance/shared/constants/catalog"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Label } from "@/src/shared/components/ui/label"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { CalendarDays, CircleAlert } from "lucide-react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

const NETWORK_OPTIONS = FINANCE_CARD_NETWORKS.map((value) => ({
  value,
  label: FINANCE_CARD_NETWORK_LABEL[value],
}))

type CardCycleSectionProps = {
  control: Control<CardFormValues>
  errors: FieldErrors<CardFormValues>
}

export function CardCycleSection({ control, errors }: CardCycleSectionProps) {
  return (
    <SummarySection title="Ciclo" icon={CalendarDays}>
      <Controller
        control={control}
        name="statementClosingDay"
        render={({ field }) => (
          <Field
            data-invalid={errors.statementClosingDay ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="card-statement-closing-day"
              className="pl-2 text-sm text-muted-foreground"
            >
              Día de corte
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <CalendarDays className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="card-statement-closing-day"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                placeholder="15"
                aria-invalid={errors.statementClosingDay ? true : undefined}
              />
            </InputGroup>
            {errors.statementClosingDay?.message ? (
              <FieldError>{errors.statementClosingDay.message}</FieldError>
            ) : null}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="paymentDueDay"
        render={({ field }) => (
          <Field
            data-invalid={errors.paymentDueDay ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="card-payment-due-day"
              className="pl-2 text-sm text-muted-foreground"
            >
              Día de pago
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <CalendarDays className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="card-payment-due-day"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                placeholder="25"
                aria-invalid={errors.paymentDueDay ? true : undefined}
              />
            </InputGroup>
            {errors.paymentDueDay?.message ? (
              <FieldError>{errors.paymentDueDay.message}</FieldError>
            ) : null}
          </Field>
        )}
      />
    </SummarySection>
  )
}

type CardOptionalDetailsSectionProps = {
  control: Control<CardFormValues>
  openByDefault: boolean
}

export function CardOptionalDetailsSection({
  control,
  openByDefault,
}: CardOptionalDetailsSectionProps) {
  return (
    <SummarySection
      title="Detalles opcionales"
      icon={CircleAlert}
      collapsible
      defaultOpen={openByDefault}
    >
      <Controller
        control={control}
        name="network"
        render={({ field }) => (
          <Field className="gap-1">
            <FieldLabel>Red</FieldLabel>
            <ToggleGroup
              value={[field.value === CATALOG_NONE ? "VISA" : field.value]}
              onValueChange={(next) => {
                if (next.length > 0) {
                  field.onChange(next[0])
                }
              }}
              variant="outline"
              size="sm"
              aria-label="Red"
            >
              {NETWORK_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="rounded-full"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-color">Color</Label>
            <ColorPickerSwatch
              id="card-color"
              value={field.value}
              onChange={field.onChange}
            />
          </div>
        )}
      />
    </SummarySection>
  )
}
