"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import {
  DEFAULT_LOCALE,
  LOCALE_OPTIONS,
} from "@/src/modules/settings/lib/locale-options"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { OptionRow } from "@/src/shared/components/forms/option-row"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { GlobeIcon, XIcon } from "lucide-react"
import { useState } from "react"

const LOCALE_ACCENT = SETTINGS_REGISTRY.account.accent

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
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Idioma"
          description="Cambia el idioma y los formatos regionales de la app."
          pending={updateProfileMutation.isPending}
        />
        <SheetBody pending={updateProfileMutation.isPending}>
          <SummarySection title="Idioma y región" icon={GlobeIcon}>
            <RadioGroup
              value={locale}
              onValueChange={(value) => setLocale(value)}
            >
              {LOCALE_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  icon={GlobeIcon}
                  iconColor={LOCALE_ACCENT}
                  accentColor={LOCALE_ACCENT}
                  label={option.label}
                  description={option.description}
                  selected={locale === option.value}
                  onPress={() => setLocale(option.value)}
                  trailing={<RadioGroupItem value={option.value} />}
                />
              ))}
            </RadioGroup>
          </SummarySection>
        </SheetBody>
        {!updateProfileMutation.isPending ? (
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </Button>
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
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
