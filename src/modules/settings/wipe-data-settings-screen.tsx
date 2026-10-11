"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { WipeUserDataView } from "@/src/modules/settings/components/sheets/wipe-user-data-sheet"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"

export function WipeDataSettingsScreen() {
  return (
    <SettingsGate>
      <WipeDataSettingsScreenBody />
    </SettingsGate>
  )
}

function WipeDataSettingsScreenBody() {
  const { user } = useAuthGuard()
  const { profileQuery } = useProfile()
  const email = profileQuery.data?.email ?? user?.email ?? ""

  return (
    <SettingsSecondaryPage title="Vaciar datos">
      <WipeUserDataView email={email} />
    </SettingsSecondaryPage>
  )
}
