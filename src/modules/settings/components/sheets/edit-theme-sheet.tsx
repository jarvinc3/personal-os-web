"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"
import { useAppearanceDraft } from "@/src/modules/settings/hooks/use-appearance-draft"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { getSettingValue } from "@/src/modules/settings/lib/settings-value"
import type { ThemeValue } from "@/src/modules/settings/types/profile.types"
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
import { Palette, SaveIcon, XIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback } from "react"

export function EditThemeSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { savePreferences, preferences, updateProfileMutation } = useProfile()
  const { setTheme } = useTheme()
  const applyTheme = useCallback(
    (theme: ThemeValue) => {
      setTheme(theme === "system" ? "system" : theme)
    },
    [setTheme]
  )
  const draft = useAppearanceDraft({
    open,
    savedValue: getSettingValue<ThemeValue>(preferences.theme),
    applyPreview: applyTheme,
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      draft.revert()
    }
    onOpenChange(nextOpen)
  }

  const handleSave = () => {
    savePreferences(
      { theme: { value: draft.value } },
      {
        onSuccess: () => {
          draft.clear()
          appToast.success({
            text1: "Tema actualizado",
            text2: "Tu preferencia de apariencia se guardó.",
          })
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Apariencia"
          description={DEFAULT_USER_PREFERENCES.theme.fieldGuide}
          pending={updateProfileMutation.isPending}
        />
        <SheetBody pending={updateProfileMutation.isPending}>
          <SummarySection title="Tema" icon={Palette}>
            <RadioGroup
              value={draft.value}
              onValueChange={(value) => {
                draft.change(value as ThemeValue)
              }}
            >
              {SETTINGS_REGISTRY.appearance.themeOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  icon={option.icon}
                  iconColor={SETTINGS_REGISTRY.appearance.accent}
                  label={option.label}
                  description={option.description}
                  selected={draft.value === option.value}
                  onPress={() => draft.change(option.value)}
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
              disabled={!draft.isDirty || updateProfileMutation.isPending}
              onClick={handleSave}
            >
              {updateProfileMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
