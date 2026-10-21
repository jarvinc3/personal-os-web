"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { DeleteAccountSheet } from "@/src/modules/settings/components/sheets/delete-account-sheet"
import { WipeAllDataSheet } from "@/src/modules/settings/components/sheets/wipe-all-data-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { usePreferenceToggle } from "@/src/modules/settings/hooks/use-preference-toggle"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

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
    useSheetParam("delete-account-sheet")
  const { open: openWipeAllSheet, setOpen: setOpenWipeAllSheet } =
    useSheetParam("wipe-all-data-sheet")
  const displayEmail = profileQuery.data?.email ?? user?.email ?? ""

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

      <WipeAllDataSheet
        open={openWipeAllSheet}
        onOpenChange={setOpenWipeAllSheet}
        email={displayEmail}
      />
      <DeleteAccountSheet
        open={openDeleteAccountSheet}
        onOpenChange={setOpenDeleteAccountSheet}
        email={displayEmail}
      />
    </SettingsSecondaryPage>
  )
}
