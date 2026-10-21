"use client"

import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditThemeSheet } from "@/src/modules/settings/components/sheets/edit-theme-sheet"
import {
  getThemeOptionLabel,
  SETTINGS_REGISTRY,
} from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { getSettingValue } from "@/src/modules/settings/lib/settings-value"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import type { ThemeValue } from "@/src/modules/settings/types/profile.types"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

export function AppearanceSettingsScreen() {
  return (
    <SettingsGate>
      <AppearanceSettingsScreenBody />
    </SettingsGate>
  )
}

function AppearanceSettingsScreenBody() {
  const { preferences } = useProfile()
  const { open: openThemeSheet, setOpen: setOpenThemeSheet } =
    useSheetParam("theme-sheet")
  const themeValue = getSettingValue<ThemeValue>(preferences.theme)

  return (
    <SettingsSecondaryPage title="Apariencia">
      <SettingsSection title="Tema">
        <SettingsRow
          label="Tema"
          description="Claro, oscuro o el que use el dispositivo."
          value={getThemeOptionLabel(themeValue)}
          onPress={() => setOpenThemeSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.appearance.accent}
          {...SETTINGS_REGISTRY.appearance.rows.theme}
        />
      </SettingsSection>

      <EditThemeSheet open={openThemeSheet} onOpenChange={setOpenThemeSheet} />
    </SettingsSecondaryPage>
  )
}
