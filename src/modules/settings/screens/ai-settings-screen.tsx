"use client"

import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditAIProviderSheet } from "@/src/modules/settings/components/sheets/edit-ai-provider-sheet"
import { EditAISheet } from "@/src/modules/settings/components/sheets/edit-ai-sheet"
import {
  getAiToneLabel,
  SETTINGS_REGISTRY,
} from "@/src/modules/settings/constants/settings-metadata"
import { usePreferenceToggle } from "@/src/modules/settings/hooks/use-preference-toggle"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

export function AiSettingsScreen() {
  return (
    <SettingsGate>
      <AiSettingsScreenBody />
    </SettingsGate>
  )
}

function AiSettingsScreenBody() {
  const { preferences } = useProfile()
  const togglePreference = usePreferenceToggle()
  const { open: openAISheet, setOpen: setOpenAISheet } =
    useSheetParam("ai-sheet")
  const { open: openAIProviderSheet, setOpen: setOpenAIProviderSheet } =
    useSheetParam("ai-provider-sheet")

  return (
    <SettingsSecondaryPage title="Asistente IA">
      <SettingsSection title="Comportamiento">
        <SettingsRow
          label="Tono de respuesta"
          value={getAiToneLabel(preferences.ai.tone)}
          onPress={() => setOpenAISheet(true)}
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.tone}
        />
        <SettingsRow
          label="Proveedor por defecto"
          value={
            preferences.ai.defaultProvider ??
            SETTINGS_REGISTRY.ai.defaultProviderLabel
          }
          onPress={() => setOpenAIProviderSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.defaultProvider}
        />
      </SettingsSection>

      <SettingsSection title="Ayuda en la app">
        <SettingsRow
          label="Insights proactivos"
          description="Sugerencias del asistente sin pedirlas."
          switchValue={preferences.ai.proactiveInsights}
          onSwitchChange={(checked) =>
            togglePreference(
              { ai: { proactiveInsights: checked } },
              "Insights proactivos actualizados."
            )
          }
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.proactiveInsights}
        />
        <SettingsRow
          label="Confirmar antes de actuar"
          description="Pide confirmación antes de ejecutar una acción."
          switchValue={preferences.ai.confirmBeforeActions}
          onSwitchChange={(checked) =>
            togglePreference(
              { ai: { confirmBeforeActions: checked } },
              "Confirmación antes de actuar actualizada."
            )
          }
          isLast
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.confirmBeforeActions}
        />
      </SettingsSection>

      <EditAISheet open={openAISheet} onOpenChange={setOpenAISheet} />
      <EditAIProviderSheet
        open={openAIProviderSheet}
        onOpenChange={setOpenAIProviderSheet}
      />
    </SettingsSecondaryPage>
  )
}
