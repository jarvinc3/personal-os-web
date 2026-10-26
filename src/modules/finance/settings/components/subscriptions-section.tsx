import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { DayWheel } from "@/src/shared/components/forms/wheel-picker"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import {
  BellRing,
  List,
  Repeat,
  SlidersHorizontal,
  Store,
  Tags,
} from "lucide-react"
import { Controller, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

/** Days of warning the user can pick without the wheel. */
const REMINDER_DAY_PRESETS = [
  { value: "3", label: "3 días", icon: BellRing },
  { value: "5", label: "5 días", icon: BellRing },
  { value: "7", label: "7 días", icon: BellRing },
  { value: "10", label: "10 días", icon: BellRing },
] as const

const GROUP_BY_OPTIONS = [
  { value: "none", label: "Ninguna", icon: List },
  { value: "category", label: "Categoría", icon: Tags },
  { value: "provider", label: "Proveedor", icon: Store },
] as const

export function SubscriptionsSection({
  control,
}: {
  control: Control<FinanceModuleFormValues>
}) {
  return (
    <SummarySection title="Suscripciones" icon={Repeat}>
      <SummaryGroup title="Aviso de próximos cobros">
        <Controller
          control={control}
          name="subscriptionReminderDays"
          render={({ field, fieldState }) => {
            const isPreset = REMINDER_DAY_PRESETS.some(
              (option) => option.value === field.value
            )
            return (
              <>
                <ChoiceGrid
                  ariaLabel="Aviso de próximos cobros"
                  accentColor={MODULE_ACCENT}
                  value={isPreset ? field.value : "custom"}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      field.onChange(isPreset ? "1" : field.value)
                      return
                    }
                    field.onChange(value)
                  }}
                  options={[
                    ...REMINDER_DAY_PRESETS,
                    {
                      value: "custom",
                      label: "Otro",
                      icon: SlidersHorizontal,
                    },
                  ]}
                  error={isPreset ? fieldState.error?.message : undefined}
                />
                {!isPreset ? (
                  <DayWheel
                    label="Días antes del cobro"
                    icon={BellRing}
                    value={field.value}
                    min={1}
                    max={30}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                ) : null}
              </>
            )
          }}
        />
      </SummaryGroup>
      <SummaryGroup title="Agrupación de la lista">
        <Controller
          control={control}
          name="subscriptionGroupBy"
          render={({ field }) => (
            <ChoiceGrid
              ariaLabel="Agrupación de la lista"
              accentColor={MODULE_ACCENT}
              value={field.value}
              onValueChange={field.onChange}
              options={GROUP_BY_OPTIONS}
            />
          )}
        />
      </SummaryGroup>
    </SummarySection>
  )
}
