"use client"

import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { FinanceCurrenciesView } from "@/src/modules/settings/components/module-settings/finance-currencies-view"

export function FinanceCurrenciesSettingsClient() {
  return (
    <SettingsSecondaryPage title="Tipos de moneda">
      <FinanceCurrenciesView />
    </SettingsSecondaryPage>
  )
}
