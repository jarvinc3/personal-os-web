"use client"

import type { ProjectsModuleFormValues } from "@/src/modules/projects/settings/lib/projects-module-form"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
import { getModule } from "@/src/shared/constants/module-registry"
import { Archive, ArrowRightLeft, Bell, BriefcaseBusiness } from "lucide-react"
import { Controller, type Control } from "react-hook-form"

const MODULE_ACCENT = getModule("projects").accent

type ProjectsPreferencesSectionProps = {
  control: Control<ProjectsModuleFormValues>
}

export function ProjectsPreferencesSection({
  control,
}: ProjectsPreferencesSectionProps) {
  return (
    <SummarySection title="Preferencias" icon={BriefcaseBusiness}>
      <Controller
        control={control}
        name="showArchived"
        render={({ field }) => (
          <SwitchFieldRow
            icon={Archive}
            iconColor={MODULE_ACCENT}
            label="Mostrar archivados"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="dueDateReminders"
        render={({ field }) => (
          <SwitchFieldRow
            icon={Bell}
            iconColor={MODULE_ACCENT}
            label="Recordatorios de fecha"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="statusChanges"
        render={({ field }) => (
          <SwitchFieldRow
            icon={ArrowRightLeft}
            iconColor={MODULE_ACCENT}
            label="Cambios de estado"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </SummarySection>
  )
}
