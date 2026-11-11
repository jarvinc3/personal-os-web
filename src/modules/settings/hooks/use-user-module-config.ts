"use client"

import { apiPatch } from "@/src/config/api-client"
import { mergeAuthUserWithProfile, PROFILE_QUERY_KEY } from "@/src/modules/auth"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { DEFAULT_LOCALE } from "@/src/modules/settings/lib/locale-options"
import {
  resolveModuleState,
  type ModuleSettingsState,
} from "@/src/modules/settings/lib/module-settings-state"
import { normalizeModuleConfig } from "@/src/modules/settings/lib/normalize-module-config"
import { mergeWithDefaults } from "@/src/modules/settings/lib/settings-value"
import type {
  ModuleConfigSlug,
  DeepPartialModuleConfig,
  UserModuleEntry,
} from "@/src/modules/settings/types/module-config.types"
import type { UserProfile } from "@/src/modules/settings/types/profile.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

type UpdateModulePayload = {
  config?: Record<string, unknown>
  isEnabled?: boolean
}

export function useUserModuleConfig<S extends ModuleConfigSlug>(slug: S) {
  const { profileQuery, userModules } = useProfile()
  const queryClient = useQueryClient()

  const entry = userModules.find((m) => m.slug === slug) as
    UserModuleEntry | undefined
  const state: ModuleSettingsState = resolveModuleState(entry)

  const rawConfig = entry?.config as Record<string, unknown> | undefined
  const rawConfigKey = useMemo(
    () => JSON.stringify(rawConfig ?? {}),
    [rawConfig]
  )

  const config = useMemo(
    () =>
      normalizeModuleConfig(
        slug,
        (rawConfigKey
          ? (JSON.parse(rawConfigKey) as Record<string, unknown>)
          : {}) as Record<string, unknown>
      ),
    [slug, rawConfigKey]
  )

  const isModuleEnabled = state === "enabled"

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateModulePayload) =>
      apiPatch<UserProfile>(API_ENDPOINTS.USERS.MODULE(slug), payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile)
      const { user, updateAuthUser } = useAppStore.getState()
      if (user) {
        updateAuthUser(mergeAuthUserWithProfile(user, profile))
      }
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
    onError: (error: Error) => {
      appToast.error({
        text1: "No se pudo guardar",
        text2: error.message,
      })
    },
  })

  const patchModule = async (payload: UpdateModulePayload) => {
    await updateMutation.mutateAsync(payload)
  }

  const updateConfig = async (
    patch: DeepPartialModuleConfig<S>,
    options?: { isEnabled?: boolean }
  ) => {
    const merged = mergeWithDefaults(
      patch as Record<string, unknown>,
      config as unknown as Record<string, unknown>
    )
    await patchModule({
      config: merged,
      ...(options?.isEnabled !== undefined
        ? { isEnabled: options.isEnabled }
        : {}),
    })
  }

  const setModuleEnabled = async (enabled: boolean) => {
    await patchModule({ isEnabled: enabled })
  }

  return {
    config,
    entry,
    state,
    isModuleEnabled,
    updateConfig,
    setModuleEnabled,
    updateMutation,
    profileQuery,
    formatLocale: profileQuery.data?.locale ?? DEFAULT_LOCALE,
  }
}
