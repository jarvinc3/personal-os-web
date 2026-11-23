"use client"

import type { HealthModuleFormValues } from "@/src/modules/health/settings/lib/health-module-form"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { OptionRow } from "@/src/shared/components/forms/option-row"
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
        <OptionRow
          icon={Ruler}
          iconColor={MODULE_ACCENT}
          label="Métrico"
          selected={units === "metric"}
          onPress={() => setValue("units", "metric", { shouldDirty: true })}
          trailing={<RadioGroupItem value="metric" />}
        />
        <OptionRow
          icon={Ruler}
          iconColor={MODULE_ACCENT}
          label="Imperial"
          selected={units === "imperial"}
          onPress={() => setValue("units", "imperial", { shouldDirty: true })}
          trailing={<RadioGroupItem value="imperial" />}
        />
      </RadioGroup>
    </SummarySection>
  )
}
