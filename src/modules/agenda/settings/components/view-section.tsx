"use client"

import type { AgendaModuleFormValues } from "@/src/modules/agenda/settings/lib/agenda-module-form"
import {
  FIELD_CHOICE_CLASS_NAME,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldMedia,
  FieldTitle,
} from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import type { AgendaModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { CalendarCog, CalendarDays } from "lucide-react"
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form"

const MODULE_ACCENT = getModule("agenda").accent

const VIEW_OPTIONS: {
  value: AgendaModuleConfig["defaultView"]
  label: string
}[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
]

type AgendaViewSectionProps = {
  control: Control<AgendaModuleFormValues>
  setValue: UseFormSetValue<AgendaModuleFormValues>
}

export function AgendaViewSection({
  control,
  setValue,
}: AgendaViewSectionProps) {
  const defaultView = useWatch({ control, name: "defaultView" })

  return (
    <>
      <SummarySection title="Vista por defecto" icon={CalendarCog}>
        <RadioGroup
          value={defaultView}
          onValueChange={(v) =>
            setValue(
              "defaultView",
              v as AgendaModuleFormValues["defaultView"],
              {
                shouldDirty: true,
              }
            )
          }
        >
          {VIEW_OPTIONS.map((o) => (
            <FieldLabel
              key={o.value}
              onClick={() =>
                setValue("defaultView", o.value, { shouldDirty: true })
              }
              className={cn(
                FIELD_CHOICE_CLASS_NAME,
                defaultView === o.value
                  ? "border bg-card/50"
                  : "border-border bg-card"
              )}
            >
              <FieldMedia icon={CalendarDays} color={MODULE_ACCENT} />
              <FieldContent>
                <FieldTitle className="text-sm">{o.label}</FieldTitle>
              </FieldContent>
              <RadioGroupItem value={o.value} />
            </FieldLabel>
          ))}
        </RadioGroup>
      </SummarySection>
      <SummarySection title="Semana inicia" icon={CalendarCog}>
        <SummaryItem
          href={APP_ROUTES.app.settingsRegional}
          icon={CalendarCog}
          accentColor={MODULE_ACCENT}
          title="Primer día de la semana"
          description="Se configura en Preferencias › Región."
          showChevron
          isLast
        />
      </SummarySection>
    </>
  )
}
