"use client"

import type { HealthModuleFormValues } from "@/src/modules/health/settings/lib/health-module-form"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
import { getModule } from "@/src/shared/constants/module-registry"
import { CalendarDays, EyeOff, HeartPulse, Target } from "lucide-react"
import { Controller, type Control } from "react-hook-form"

const MODULE_ACCENT = getModule("health").accent

type HealthPreferencesSectionProps = {
  control: Control<HealthModuleFormValues>
}

export function HealthPreferencesSection({
  control,
}: HealthPreferencesSectionProps) {
  return (
    <SummarySection title="Preferencias" icon={HeartPulse}>
      <Controller
        control={control}
        name="hideSensitiveMetrics"
        render={({ field }) => (
          <SwitchFieldRow
            icon={EyeOff}
            iconColor={MODULE_ACCENT}
            label="Ocultar métricas sensibles"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="goalReminders"
        render={({ field }) => (
          <SwitchFieldRow
            icon={Target}
            iconColor={MODULE_ACCENT}
            label="Recordatorios de metas"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="weeklySummary"
        render={({ field }) => (
          <SwitchFieldRow
            icon={CalendarDays}
            iconColor={MODULE_ACCENT}
            label="Resumen semanal"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </SummarySection>
  )
}
