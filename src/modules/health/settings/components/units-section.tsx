"use client"

import type { HealthModuleFormValues } from "@/src/modules/health/settings/lib/health-module-form"
import {
  FIELD_CHOICE_CLASS_NAME,
  FieldContent,
  FieldLabel,
  FieldMedia,
  FieldTitle,
  activeRowStyle,
} from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { getModule } from "@/src/shared/constants/module-registry"
import { Ruler } from "lucide-react"
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form"

const MODULE_ACCENT = getModule("health").accent

type HealthUnitsSectionProps = {
  control: Control<HealthModuleFormValues>
  setValue: UseFormSetValue<HealthModuleFormValues>
}

export function HealthUnitsSection({
  control,
  setValue,
}: HealthUnitsSectionProps) {
  const units = useWatch({ control, name: "units" })

  return (
    <SummarySection title="Unidades" icon={Ruler}>
      <RadioGroup
        value={units}
        onValueChange={(v) =>
          setValue("units", v as HealthModuleFormValues["units"], {
            shouldDirty: true,
          })
        }
      >
        <FieldLabel
          onClick={() => setValue("units", "metric", { shouldDirty: true })}
          className={cn(FIELD_CHOICE_CLASS_NAME, "border-border bg-card")}
          style={activeRowStyle(MODULE_ACCENT, units === "metric")}
        >
          <FieldMedia icon={Ruler} color={MODULE_ACCENT} />
          <FieldContent>
            <FieldTitle className="text-sm">Métrico</FieldTitle>
          </FieldContent>
          <RadioGroupItem value="metric" />
        </FieldLabel>
        <FieldLabel
          onClick={() => setValue("units", "imperial", { shouldDirty: true })}
          className={cn(FIELD_CHOICE_CLASS_NAME, "border-border bg-card")}
          style={activeRowStyle(MODULE_ACCENT, units === "imperial")}
        >
          <FieldMedia icon={Ruler} color={MODULE_ACCENT} />
          <FieldContent>
            <FieldTitle className="text-sm">Imperial</FieldTitle>
          </FieldContent>
          <RadioGroupItem value="imperial" />
        </FieldLabel>
      </RadioGroup>
    </SummarySection>
  )
}
