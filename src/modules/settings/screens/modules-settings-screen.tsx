"use client"

import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { ModuleSettingsRows } from "@/src/modules/settings/components/profile-ui"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import { settingsModuleHref } from "@/src/shared/constants/app-routes"
import type { ConfigurableModuleSlug } from "@/src/modules/settings/types/module-config.types"

export function ModulesSettingsScreen() {
  return (
    <SettingsGate>
      <ModulesSettingsScreenBody />
    </SettingsGate>
  )
}

function ModulesSettingsScreenBody() {
  const { navigate } = usePendingNavigation()

  const openModule = (slug: ConfigurableModuleSlug) => {
    navigate(settingsModuleHref(slug))
  }

  return (
    <SettingsSecondaryPage title="Módulos">
      <p className="px-1 text-sm text-muted-foreground">
        Elige una app para ver y guardar sus ajustes.
      </p>
      <ModuleSettingsRows onOpenModule={openModule} />
    </SettingsSecondaryPage>
  )
}
