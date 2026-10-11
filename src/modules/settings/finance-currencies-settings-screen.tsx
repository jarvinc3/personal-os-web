"use client"

import { FinanceCurrenciesView } from "@/src/modules/settings/components/module-settings/finance-currencies-view"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { SettingsGate } from "@/src/modules/settings/settings-gate"

export function FinanceCurrenciesSettingsScreen() {
  return (
    <SettingsGate>
      <FinanceCurrenciesSettingsScreenBody />
    </SettingsGate>
  )
}

function FinanceCurrenciesSettingsScreenBody() {
  return (
    <SettingsSecondaryPage title="Tipos de moneda">
      <FinanceCurrenciesView />
    </SettingsSecondaryPage>
  )
}
