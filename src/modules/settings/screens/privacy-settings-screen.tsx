"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { DeleteAccountSheet } from "@/src/modules/settings/components/sheets/delete-account-sheet"
import { WipeDataSheet } from "@/src/modules/settings/components/sheets/wipe-data-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import { usePreferenceToggle } from "@/src/modules/settings/hooks/use-preference-toggle"
import { WIPE_LAYER_ORDER } from "@/src/modules/settings/lib/wipe-layers"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useAiConsent } from "@/src/modules/intelligence"
import { BrainCircuit } from "lucide-react"

export function PrivacySettingsScreen() {
  return (
    <SettingsGate>
      <PrivacySettingsScreenBody />
    </SettingsGate>
  )
}

function PrivacySettingsScreenBody() {
  const { user } = useAuthGuard()
  const { preferences, profileQuery } = useProfile()
  const togglePreference = usePreferenceToggle()
  const { open: openDeleteAccountSheet, setOpen: setOpenDeleteAccountSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.deleteAccount)
  const { open: openWipeAllSheet, setOpen: setOpenWipeAllSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.wipeData)
  const displayEmail = profileQuery.data?.email ?? user?.email ?? ""
  const { consentQuery, consentMutation } = useAiConsent()

  return (
    <SettingsSecondaryPage title="Privacidad y datos">
      <SettingsSection title="Privacidad">
        <SettingsRow
          label="Analíticas"
          description="Ayuda a mejorar la app con datos de uso."
          switchValue={preferences.privacy.analyticsEnabled}
          onSwitchChange={(checked) =>
            togglePreference(
              { privacy: { analyticsEnabled: checked } },
              "Preferencia de analíticas actualizada."
            )
          }
          accentColor={SETTINGS_REGISTRY.privacy.accent}
          {...SETTINGS_REGISTRY.privacy.rows.analytics}
        />
        <SettingsRow
          label="Reportes de fallos"
          description="Envía información cuando algo falla."
          switchValue={preferences.privacy.crashReportsEnabled}
          onSwitchChange={(checked) =>
            togglePreference(
              { privacy: { crashReportsEnabled: checked } },
              "Preferencia de reportes actualizada."
            )
          }
          isLast
          accentColor={SETTINGS_REGISTRY.privacy.accent}
          {...SETTINGS_REGISTRY.privacy.rows.crashReports}
        />
        <SettingsRow
          label="Contribuir al conocimiento global de IA"
          description="Permite usar mensajes saneados para mejorar el conocimiento compartido. Puedes revocarlo cuando quieras."
          switchValue={consentQuery.data?.contributeToGlobalKnowledge ?? true}
          onSwitchChange={(checked) => consentMutation.mutate(checked)}
          disabled={
            consentQuery.isPending ||
            consentMutation.isPending ||
            consentQuery.isError
          }
          isLast
          icon={BrainCircuit}
          accentColor="#8b5cf6"
        />
        {consentQuery.isError ? (
          <ErrorState
            message="No se pudo cargar el consentimiento de analítica."
            onRetry={() => void consentQuery.refetch()}
            isRetrying={consentQuery.isFetching}
          />
        ) : null}
      </SettingsSection>

      <SettingsSection
        title="Tus datos"
        description="Estas acciones afectan a toda la cuenta."
      >
        <SettingsRow
          label="Vaciar todos los datos"
          description="Borra el contenido de todas las apps y vuelve la configuración a sus valores por defecto."
          destructive
          onPress={() => setOpenWipeAllSheet(true)}
          accentColor={SETTINGS_REGISTRY.danger.accent}
          {...SETTINGS_REGISTRY.danger.rows.wipeData}
        />
        <SettingsRow
          label="Eliminar la cuenta"
          description="Borra la cuenta y todos sus datos. No se puede deshacer."
          destructive
          onPress={() => setOpenDeleteAccountSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.danger.accent}
          {...SETTINGS_REGISTRY.danger.rows.deleteAccount}
        />
      </SettingsSection>

      <WipeDataSheet
        open={openWipeAllSheet}
        onOpenChange={setOpenWipeAllSheet}
        email={displayEmail}
        title="Vaciar todos los datos"
        description="Borra el contenido de todas las apps. La cuenta se conserva."
        scope={{
          layers: WIPE_LAYER_ORDER,
          confirmTitle: "¿Vaciar todos los datos?",
        }}
      />
      <DeleteAccountSheet
        open={openDeleteAccountSheet}
        onOpenChange={setOpenDeleteAccountSheet}
        email={displayEmail}
      />
    </SettingsSecondaryPage>
  )
}
