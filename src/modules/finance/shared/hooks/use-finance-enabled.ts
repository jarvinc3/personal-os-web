"use client"

import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"

export function useFinanceEnabled() {
  const { config, state, isModuleEnabled, profileQuery, formatLocale } =
    useUserModuleConfig("finance")

  return {
    config,
    state,
    isEnabled: isModuleEnabled,
    formatLocale,
    isProfileLoading: profileQuery.isLoading,
  }
}
