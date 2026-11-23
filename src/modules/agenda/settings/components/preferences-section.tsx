"use client"

import type { AgendaModuleFormValues } from "@/src/modules/agenda/settings/lib/agenda-module-form"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
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
          <SwitchFieldRow
            icon={Briefcase}
            iconColor={MODULE_ACCENT}
            label="Horario laboral"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="eventReminders"
        render={({ field }) => (
          <SwitchFieldRow
            icon={Bell}
            iconColor={MODULE_ACCENT}
            label="Recordatorios de eventos"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="dailyAgenda"
        render={({ field }) => (
          <SwitchFieldRow
            icon={CalendarCheck}
            iconColor={MODULE_ACCENT}
            label="Agenda diaria"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </SummarySection>
  )
}
