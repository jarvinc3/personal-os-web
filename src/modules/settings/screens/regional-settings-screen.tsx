"use client"

import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditLocaleSheet } from "@/src/modules/settings/components/sheets/edit-locale-sheet"
import { EditTimeZoneSheet } from "@/src/modules/settings/components/sheets/edit-time-zone-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import {
  DEFAULT_LOCALE,
  localeLabel,
} from "@/src/modules/settings/lib/locale-options"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { settingsModuleHref } from "@/src/shared/constants/app-routes"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { Coins, Globe } from "lucide-react"

const REGIONAL_ACCENT = SETTINGS_REGISTRY.account.accent

export function RegionalSettingsScreen() {
  return (
    <SettingsGate>
      <RegionalSettingsScreenBody />
    </SettingsGate>
  )
}

function RegionalSettingsScreenBody() {
  const { profileQuery } = useProfile()
  const { config } = useUserModuleConfig("finance")
  const { navigate, isPending } = usePendingNavigation()
  const { open: openTimeZoneSheet, setOpen: setOpenTimeZoneSheet } =
    useSheetParam("time-zone-sheet")
  const { open: openLocaleSheet, setOpen: setOpenLocaleSheet } =
    useSheetParam("locale-sheet")

  const profile = profileQuery.data
  const timeZone = profile?.timezone?.trim() || "Sin definir"
  const locale = localeLabel(profile?.locale)

  return (
    <SettingsSecondaryPage title="Preferencias regionales">
      <SettingsSection title="Región">
        <SettingsRow
          label="Zona horaria"
          description="Las fechas y horas se muestran en esta zona."
          value={timeZone}
          onPress={() => setOpenTimeZoneSheet(true)}
          accentColor={REGIONAL_ACCENT}
          {...SETTINGS_REGISTRY.account.rows.timeZone}
        />
        <SettingsRow
          label="Idioma"
          description="Idioma y formatos regionales de la app."
          value={locale}
          onPress={() => setOpenLocaleSheet(true)}
          accentColor={REGIONAL_ACCENT}
          icon={Globe}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Moneda">
        <SettingsRow
          label="Moneda por defecto"
          description="La moneda principal de Finanzas."
          value={config.baseCurrency}
          onPress={() => navigate(settingsModuleHref("finance"))}
          disabled={isPending}
          accentColor={SETTINGS_REGISTRY.account.accent}
          icon={Coins}
          isLast
        />
      </SettingsSection>

      <EditTimeZoneSheet
        open={openTimeZoneSheet}
        onOpenChange={setOpenTimeZoneSheet}
      />
      <EditLocaleSheet
        key={profile?.locale ?? DEFAULT_LOCALE}
        open={openLocaleSheet}
        onOpenChange={setOpenLocaleSheet}
      />
    </SettingsSecondaryPage>
  )
}
