"use client"

import type { HealthModuleFormValues } from "@/src/modules/health/settings/lib/health-module-form"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldMedia,
  activeRowStyle,
} from "@/src/shared/components/ui/field"
import { Switch } from "@/src/shared/components/ui/switch"
import { SummarySection } from "@/src/shared/components/data-display/summary"
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
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={EyeOff} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>
                Ocultar métricas sensibles
              </FieldLabel>
            </FieldContent>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="goalReminders"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={Target} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>
                Recordatorios de metas
              </FieldLabel>
            </FieldContent>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="weeklySummary"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={CalendarDays} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Resumen semanal</FieldLabel>
            </FieldContent>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />
    </SummarySection>
  )
}
