"use client"

import { EditAppearanceStyleSheet } from "@/src/modules/settings/components/sheets/edit-appearance-style-sheet"
import { EditPrimaryColorSheet } from "@/src/modules/settings/components/sheets/edit-primary-color-sheet"
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
import { findAppearanceStyle, findPrimaryColor } from "@/src/shared/appearance"
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
  const { open: openStyleSheet, setOpen: setOpenStyleSheet } =
    useSheetParam("style-sheet")
  const { open: openColorSheet, setOpen: setOpenColorSheet } = useSheetParam(
    "primary-color-sheet"
  )
  const themeValue = getSettingValue<ThemeValue>(preferences.theme)
  const { style, primaryColor } = preferences.theme
  const styleOption = findAppearanceStyle(style)
  const colorOption = findPrimaryColor(primaryColor)

  return (
    <SettingsSecondaryPage title="Apariencia">
      <SettingsSection title="Apariencia">
        <SettingsRow
          label="Modo"
          description="Claro, oscuro o el que use el dispositivo."
          value={getThemeOptionLabel(themeValue)}
          onPress={() => setOpenThemeSheet(true)}
          accentColor={SETTINGS_REGISTRY.appearance.accent}
          {...SETTINGS_REGISTRY.appearance.rows.theme}
        />
        <SettingsRow
          label="Estilo visual"
          description="Formas, bordes y sombras de la interfaz."
          value={styleOption?.label ?? style}
          onPress={() => setOpenStyleSheet(true)}
          accentColor={SETTINGS_REGISTRY.appearance.accent}
          {...SETTINGS_REGISTRY.appearance.rows.style}
        />
        <SettingsRow
          label="Color primario"
          description="Botones, enlaces y acentos de la app."
          value={colorOption?.label ?? primaryColor}
          onPress={() => setOpenColorSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.appearance.accent}
          trailing={
            <span
              aria-hidden
              className="size-5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: primaryColor }}
            />
          }
          {...SETTINGS_REGISTRY.appearance.rows.primaryColor}
        />
      </SettingsSection>

      <EditThemeSheet open={openThemeSheet} onOpenChange={setOpenThemeSheet} />
      <EditAppearanceStyleSheet
        open={openStyleSheet}
        onOpenChange={setOpenStyleSheet}
      />
      <EditPrimaryColorSheet
        open={openColorSheet}
        onOpenChange={setOpenColorSheet}
      />
    </SettingsSecondaryPage>
  )
}
