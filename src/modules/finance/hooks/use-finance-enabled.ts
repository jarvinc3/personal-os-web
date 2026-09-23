"use client"

import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"

export function useFinanceEnabled() {
  const { config, state, isModuleEnabled, profileQuery } = useUserModuleConfig("finance")

  return {
    config,
    state,
    isEnabled: isModuleEnabled,
    emailSyncEnabled: isModuleEnabled && config.emailSync.enabled,
    emailSyncAutomatic:
      isModuleEnabled &&
      config.emailSync.enabled &&
      config.emailSync.automatic,
    isProfileLoading: profileQuery.isLoading,
  }
}
