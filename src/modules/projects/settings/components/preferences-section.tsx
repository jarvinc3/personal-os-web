"use client"

import type { ProjectsModuleFormValues } from "@/src/modules/projects/settings/lib/projects-module-form"
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
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={Archive} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Mostrar archivados</FieldLabel>
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
        name="dueDateReminders"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={Bell} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>
                Recordatorios de fecha
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
        name="statusChanges"
        render={({ field }) => (
          <Field
            variant="card"
            orientation="horizontal"
            style={activeRowStyle(MODULE_ACCENT, field.value)}
          >
            <FieldMedia icon={ArrowRightLeft} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Cambios de estado</FieldLabel>
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
