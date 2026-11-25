"use client"

import type { AgendaModuleFormValues } from "@/src/modules/agenda/settings/lib/agenda-module-form"
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
import { Bell, Briefcase, CalendarCheck } from "lucide-react"
import { Controller, type Control } from "react-hook-form"

const MODULE_ACCENT = getModule("agenda").accent

type AgendaPreferencesSectionProps = {
  control: Control<AgendaModuleFormValues>
}

export function AgendaPreferencesSection({
  control,
}: AgendaPreferencesSectionProps) {
  return (
    <SummarySection title="Preferencias" icon={Briefcase}>
      <Controller
        control={control}
        name="workingHoursEnabled"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={Briefcase} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Horario laboral</FieldLabel>
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
        name="eventReminders"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={Bell} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>
                Recordatorios de eventos
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
        name="dailyAgenda"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={CalendarCheck} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Agenda diaria</FieldLabel>
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
