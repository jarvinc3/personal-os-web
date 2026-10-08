"use client"

import { AgendaModuleSettingsForm } from "@/src/modules/settings/components/module-settings/agenda-module-settings-form"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function AgendaModuleSettingsClient() {
  const router = useRouter()
  const handleDone = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.settings)
  }, [router])

  return (
    <SettingsSecondaryPage title={getModule("agenda").label}>
      <AgendaModuleSettingsForm onDone={handleDone} />
    </SettingsSecondaryPage>
  )
}
