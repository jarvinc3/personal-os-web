"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { localeLabel } from "@/src/modules/settings/lib/locale-options"
import {
  WEEK_STARTS_ON_OPTIONS,
  weekStartsOnFromLocale,
  weekStartsOnLabel,
} from "@/src/modules/settings/lib/week-starts-on"
import type { WeekStartsOn } from "@/src/modules/settings/types/profile.types"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { OptionRow } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { CalendarRangeIcon, XIcon } from "lucide-react"
import { useState } from "react"

const WEEK_START_ACCENT = SETTINGS_REGISTRY.account.accent
const AUTOMATIC = "auto"

type Selection = typeof AUTOMATIC | "0" | "1" | "6"

function selectionFrom(weekStartsOn: WeekStartsOn | null): Selection {
  return weekStartsOn === null ? AUTOMATIC : (String(weekStartsOn) as Selection)
}

export function EditWeekStartSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { profileQuery, preferences, savePreferences, updateProfileMutation } =
    useProfile()
  const locale = profileQuery.data?.locale
  const stored = preferences.regional.weekStartsOn
  const automaticDay = weekStartsOnFromLocale(locale)
  const [selection, setSelection] = useState<Selection>(selectionFrom(stored))
  const isDirty = selection !== selectionFrom(stored)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onOpenChange(false)
      return
    }
    setSelection(selectionFrom(stored))
    onOpenChange(true)
  }

  const handleSave = () => {
    const weekStartsOn =
      selection === AUTOMATIC ? null : (Number(selection) as WeekStartsOn)
    savePreferences(
      { regional: { weekStartsOn } },
      {
        onSuccess: () => {
          appToast.success({ text1: "Primer día de la semana actualizado" })
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Primer día de la semana"
      description="Se usa en los calendarios y en las semanas de toda la app."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            className="flex-1"
            disabled={!isDirty || updateProfileMutation.isPending}
            onClick={handleSave}
          >
            {updateProfileMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Semana" icon={CalendarRangeIcon}>
        <RadioGroup
          value={selection}
          onValueChange={(value) => setSelection(value as Selection)}
        >
          <OptionRow
            icon={CalendarRangeIcon}
            iconColor={WEEK_START_ACCENT}
            accentColor={WEEK_START_ACCENT}
            label="Según la región"
            description={`${weekStartsOnLabel(automaticDay)} en ${localeLabel(locale)}.`}
            selected={selection === AUTOMATIC}
            onPress={() => setSelection(AUTOMATIC)}
            trailing={<RadioGroupItem value={AUTOMATIC} />}
          />
          {WEEK_STARTS_ON_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={CalendarRangeIcon}
              iconColor={WEEK_START_ACCENT}
              accentColor={WEEK_START_ACCENT}
              label={option.label}
              description={`La semana empieza el ${option.label.toLowerCase()}.`}
              selected={selection === String(option.value)}
              onPress={() =>
                setSelection(String(option.value) as Selection)
              }
              trailing={<RadioGroupItem value={String(option.value)} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
    </BottomSheet>
  )
}
