"use client"

import { ApiError, apiGet, apiPatch } from "@/src/config/api-client"
import { mergeAuthUserWithProfile, PROFILE_QUERY_KEY } from "@/src/modules/auth"
import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"
import { mergeUserPreferences } from "@/src/modules/settings/lib/merge-user-preferences"
import { normalizeUserPreferences } from "@/src/modules/settings/lib/normalize-preferences"
import { applyProfilePatch } from "@/src/modules/settings/lib/profile-optimistic"
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
import { useCallback, useMemo } from "react"

const PROFILE_UPDATE_MUTATION_KEY = ["profile-update"] as const
const PROFILE_UPDATE_SCOPE = "profile-update"

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
    mutationKey: PROFILE_UPDATE_MUTATION_KEY,
    scope: { id: PROFILE_UPDATE_SCOPE },
    mutationFn: (payload: UpdateProfilePayload) =>
      apiPatch<UserProfile>(API_ENDPOINTS.USERS.UPDATE_ME, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY })
      const previousProfile =
        queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY)
      queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEY, (profile) =>
        profile ? applyProfilePatch(profile, payload) : profile
      )
      return { previousProfile }
    },
    onSuccess: (profile) => {
      if (
        queryClient.isMutating({ mutationKey: PROFILE_UPDATE_MUTATION_KEY }) > 1
      ) {
        return
      }
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile)
      const { user, updateAuthUser } = useAppStore.getState()
      if (user) {
        updateAuthUser(mergeAuthUserWithProfile(user, profile))
      }
    },
    onError: (error, _payload, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile)
      }
      appToast.error({
        text1: "No se pudo guardar",
        text2: error.message,
      })
    },
  })

  const preferencesFromPatch = useCallback(
    (patch: DeepPartial<UserPreferences>): UserPreferences => {
      const current =
        queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY)?.preferences
      return mergeUserPreferences(current, patch)
    },
    [queryClient]
  )

  const updatePreferences = async (patch: DeepPartial<UserPreferences>) => {
    await updateProfileMutation.mutateAsync({
      preferences: preferencesFromPatch(patch),
    })
  }

  const savePreferences = useCallback(
    (
      patch: DeepPartial<UserPreferences>,
      options?: { onSuccess?: () => void; onError?: () => void }
    ) => {
      updateProfileMutation.mutate(
        { preferences: preferencesFromPatch(patch) },
        { onSuccess: options?.onSuccess, onError: options?.onError }
      )
    },
    [preferencesFromPatch, updateProfileMutation]
  )

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
    savePreferences,
    preferences,
    userModules,
  }
}
