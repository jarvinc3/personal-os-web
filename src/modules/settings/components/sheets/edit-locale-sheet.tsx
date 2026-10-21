"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import {
  DEFAULT_LOCALE,
  LOCALE_OPTIONS,
} from "@/src/modules/settings/lib/locale-options"
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
import { GlobeIcon, XIcon } from "lucide-react"
import { useState } from "react"

export function EditLocaleSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { profileQuery, updateProfileMutation } = useProfile()
  const current = profileQuery.data?.locale ?? DEFAULT_LOCALE
  const [locale, setLocale] = useState(current)
  const isDirty = locale !== current

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onOpenChange(false)
      return
    }
    setLocale(current)
    onOpenChange(true)
  }

  const handleSave = () => {
    updateProfileMutation.mutate(
      { locale },
      {
        onSuccess: () => {
          appToast.success({ text1: "Idioma actualizado" })
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Idioma"
      description="Cambia el idioma y los formatos regionales de la app."
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
      <SummarySection title="Idioma y región" icon={GlobeIcon}>
        <RadioGroup value={locale} onValueChange={(value) => setLocale(value)}>
          {LOCALE_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={GlobeIcon}
              iconColor="#037cff"
              accentColor="#037cff"
              label={option.label}
              description={option.description}
              selected={locale === option.value}
              onPress={() => setLocale(option.value)}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
    </BottomSheet>
  )
}
