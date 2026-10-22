"use client"

import { usePendingModuleActivations } from "@/src/modules/settings/hooks/use-pending-module-activations"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { pendingActivation } from "@/src/modules/settings/lib/module-activation-status"
import type { ConfigurableModuleSlug } from "@/src/modules/settings/types/module-config.types"
import { useCallback, useMemo, useState } from "react"

export function useModuleSheetEnable(slug: ConfigurableModuleSlug) {
  const { state, entry } = useUserModuleConfig(slug)
  const { setPendingActivation } = usePendingModuleActivations()

  const savedIsEnabled = entry?.isEnabled ?? false

  const [pendingEnabled, setPendingEnabled] = useState(
    state === "unconfigured" ? false : savedIsEnabled
  )

  const isEnabledDirty = useMemo(
    () =>
      state === "unconfigured"
        ? pendingEnabled !== false
        : pendingEnabled !== savedIsEnabled,
    [pendingEnabled, savedIsEnabled, state]
  )

  const handleEnabledChange = useCallback(
    (checked: boolean) => {
      setPendingEnabled(checked)
      setPendingActivation(slug, pendingActivation(savedIsEnabled, checked))
    },
    [savedIsEnabled, setPendingActivation, slug]
  )

  const markSaved = useCallback(() => {
    setPendingActivation(slug, null)
  }, [setPendingActivation, slug])

  const syncPendingOnSheetOpen = useCallback(() => {
    setPendingEnabled(
      state === "unconfigured" ? false : Boolean(entry?.isEnabled)
    )
    setPendingActivation(slug, null)
  }, [entry?.isEnabled, setPendingActivation, slug, state])

  return {
    state,
    sheetEnabled: pendingEnabled,
    pendingEnabled,
    isEnabledDirty,
    savedIsEnabled,
    handleEnabledChange,
    markSaved,
    syncPendingOnSheetOpen,
  }
}
