"use client"

import {
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_NETWORKS,
  CATALOG_NONE,
} from "@/src/modules/finance/shared/constants/catalog"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Label } from "@/src/shared/components/ui/label"
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
          <FormTextField
            icon={CalendarDays}
            label="Día de corte"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.statementClosingDay?.message}
            placeholder="15"
          />
        )}
      />
      <Controller
        control={control}
        name="paymentDueDay"
        render={({ field }) => (
          <FormTextField
            icon={CalendarDays}
            label="Día de pago"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.paymentDueDay?.message}
            placeholder="25"
          />
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
          <FinanceSegmentedControl
            label="Red"
            value={field.value === CATALOG_NONE ? "VISA" : field.value}
            onChange={field.onChange}
            options={NETWORK_OPTIONS}
          />
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
