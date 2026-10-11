"use client"

import { ApiError, apiGet, apiPatch } from "@/src/config/api-client"
import { mergeAuthUserWithProfile, PROFILE_QUERY_KEY } from "@/src/modules/auth"
import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"
import { normalizeUserPreferences } from "@/src/modules/settings/lib/normalize-preferences"
import { mergeWithDefaults } from "@/src/modules/settings/lib/settings-value"
import type {
  DeepPartial,
  UpdateProfilePayload,
  UserPreferences,
  UserProfile,
} from "@/src/modules/settings/types/profile.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

export function mergeUserPreferences(
  current: UserPreferences | null | undefined,
  patch: DeepPartial<UserPreferences>
): UserPreferences {
  const normalized = normalizeUserPreferences(current)
  return mergeWithDefaults(
    patch as Record<string, unknown>,
    normalized as unknown as Record<string, unknown>
  ) as UserPreferences
}

export function useProfile() {
  const queryClient = useQueryClient()
  const session = useAppStore((state) => state.session)

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiGet<UserProfile>(API_ENDPOINTS.USERS.GET_ME),
    enabled: Boolean(session),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        return false
      }
      return failureCount < 2
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiPatch<UserProfile>(API_ENDPOINTS.USERS.UPDATE_ME, payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile)
      const { user, updateAuthUser } = useAppStore.getState()
      if (user) {
        updateAuthUser(mergeAuthUserWithProfile(user, profile))
      }
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo guardar",
        text2: error.message,
      })
    },
  })

  const updatePreferences = async (patch: DeepPartial<UserPreferences>) => {
    const current = profileQuery.data?.preferences
    const preferences = mergeUserPreferences(current, patch)
    await updateProfileMutation.mutateAsync({ preferences })
  }

  const rawPreferences = profileQuery.data?.preferences
  const preferences = useMemo(
    () => normalizeUserPreferences(rawPreferences ?? DEFAULT_USER_PREFERENCES),
    [rawPreferences]
  )

  const userModules = useMemo(
    () => profileQuery.data?.userModules ?? [],
    [profileQuery.data?.userModules]
  )

  return {
    profileQuery,
    updateProfileMutation,
    updatePreferences,
    preferences,
    userModules,
  }
}
