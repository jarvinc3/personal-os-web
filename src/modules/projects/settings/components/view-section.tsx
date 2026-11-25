"use client"

import type { ProjectsModuleFormValues } from "@/src/modules/projects/settings/lib/projects-module-form"
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
import { CalendarRange, Columns3, List } from "lucide-react"
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form"

const MODULE_ACCENT = getModule("projects").accent

const PROJECT_VIEW_OPTIONS = [
  { value: "board", label: "Tablero", icon: Columns3 },
  { value: "list", label: "Lista", icon: List },
  { value: "timeline", label: "Cronograma", icon: CalendarRange },
] as const

type ProjectsViewSectionProps = {
  control: Control<ProjectsModuleFormValues>
  setValue: UseFormSetValue<ProjectsModuleFormValues>
}

export function ProjectsViewSection({
  control,
  setValue,
}: ProjectsViewSectionProps) {
  const defaultView = useWatch({ control, name: "defaultView" })

  return (
    <SummarySection title="Vista por defecto" icon={Columns3}>
      <RadioGroup
        value={defaultView}
        onValueChange={(v) =>
          setValue(
            "defaultView",
            v as ProjectsModuleFormValues["defaultView"],
            {
              shouldDirty: true,
            }
          )
        }
      >
        {PROJECT_VIEW_OPTIONS.map((option) => (
          <FieldLabel
            key={option.value}
            onClick={() =>
              setValue("defaultView", option.value, { shouldDirty: true })
            }
            className={cn(FIELD_CHOICE_CLASS_NAME, "border-border bg-card")}
            style={activeRowStyle(MODULE_ACCENT, defaultView === option.value)}
          >
            <FieldMedia icon={option.icon} color={MODULE_ACCENT} />
            <FieldContent>
              <FieldTitle className="text-sm">{option.label}</FieldTitle>
            </FieldContent>
            <RadioGroupItem value={option.value} />
          </FieldLabel>
        ))}
      </RadioGroup>
    </SummarySection>
  )
}
