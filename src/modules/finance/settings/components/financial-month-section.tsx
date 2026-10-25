import { DayWheel } from "@/src/shared/components/forms/wheel-picker"
import {
  SummaryGroup,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { CalendarRange } from "lucide-react"
import { Controller, type Control } from "react-hook-form"
import type { FinanceModuleFormValues } from "@/src/modules/finance/settings/lib/finance-module-form"

export function FinancialMonthSection({
  control,
}: {
  control: Control<FinanceModuleFormValues>
}) {
  return (
    <SummarySection title="Mes financiero" icon={CalendarRange}>
      <SummaryGroup title="Inicio del mes financiero">
        <Controller
          control={control}
          name="monthStartDay"
          render={({ field, fieldState }) => (
            <DayWheel
              icon={CalendarRange}
              value={field.value}
              min={1}
              max={28}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </SummaryGroup>
    </SummarySection>
  )
}
