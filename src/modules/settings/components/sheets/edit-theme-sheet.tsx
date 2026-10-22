"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { getSettingValue } from "@/src/modules/settings/lib/settings-value"
import type { ThemeValue } from "@/src/modules/settings/types/profile.types"
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
import { Palette, SaveIcon, XIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useState } from "react"

export function EditThemeSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { savePreferences, preferences, updateProfileMutation } = useProfile()
  const { setTheme } = useTheme()
  const currentTheme = getSettingValue<ThemeValue>(preferences.theme)
  const [draftTheme, setDraftTheme] = useState<ThemeValue | null>(null)
  const themeValue = draftTheme ?? currentTheme
  const isDirty = draftTheme !== null && draftTheme !== currentTheme

  const applyTheme = useCallback(
    (theme: ThemeValue) => {
      setTheme(theme === "system" ? "system" : theme)
    },
    [setTheme]
  )

  const revertDraft = useCallback(() => {
    setDraftTheme(null)
    applyTheme(currentTheme)
  }, [applyTheme, currentTheme])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      revertDraft()
    }
    onOpenChange(nextOpen)
  }

  const handleThemeChange = (value: ThemeValue) => {
    setDraftTheme(value)
    applyTheme(value)
  }

  const handleSave = () => {
    savePreferences(
      { theme: { value: themeValue } },
      {
        onSuccess: () => {
          setDraftTheme(null)
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
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Apariencia"
      description={DEFAULT_USER_PREFERENCES.theme.fieldGuide}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              handleOpenChange(false)
            }}
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
            ) : (
              <SaveIcon className="size-4 shrink-0" />
            )}
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Tema" icon={Palette}>
        <RadioGroup
          value={themeValue}
          onValueChange={(value) => {
            handleThemeChange(value as ThemeValue)
          }}
        >
          {SETTINGS_REGISTRY.appearance.themeOptions.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              iconColor={SETTINGS_REGISTRY.appearance.accent}
              label={option.label}
              description={option.description}
              selected={themeValue === option.value}
              onPress={() => handleThemeChange(option.value)}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
    </BottomSheet>
  )
}
