"use client"

import type { AgendaModuleFormValues } from "@/src/modules/agenda/settings/lib/agenda-module-form"
import {
  FIELD_CHOICE_CLASS_NAME,
  FieldContent,
  FieldLabel,
  FieldMedia,
  FieldTitle,
  activeRowStyle,
} from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import type { AgendaModuleConfig } from "@/src/modules/settings/types/module-config.types"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { CalendarCog, CalendarDays, ChevronRightIcon } from "lucide-react"
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
              className={cn(FIELD_CHOICE_CLASS_NAME, "border-border bg-card")}
              style={activeRowStyle(MODULE_ACCENT, defaultView === o.value)}
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
        <Item
          variant="default"
          render={<Link href={APP_ROUTES.app.settingsRegional} />}
        >
          <ItemMedia
            variant="icon"
            style={{
              backgroundColor: `color-mix(in srgb, ${MODULE_ACCENT} 18%, transparent)`,
            }}
          >
            <CalendarCog style={{ color: MODULE_ACCENT }} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Primer día de la semana"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {"Se configura en Preferencias › Región."}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <LinkPendingOverlay />
          </ItemActions>
        </Item>
      </SummarySection>
    </>
  )
}
