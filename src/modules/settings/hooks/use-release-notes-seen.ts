"use client"

import { apiPatch } from "@/src/config/api-client"
import { PROFILE_QUERY_KEY } from "@/src/modules/auth"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type { UserProfile } from "@/src/modules/settings/types/profile.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useReleaseNotesSeen() {
  const { profileQuery } = useProfile()
  const queryClient = useQueryClient()

  const { mutate: markReleaseNotesSeen } = useMutation({
    mutationFn: (version: string) =>
      apiPatch<UserProfile>(API_ENDPOINTS.USERS.RELEASE_NOTES_SEEN, {
        version,
      }),
    onMutate: async (version) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY })
      const previousProfile =
        queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY)
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEY, {
          ...previousProfile,
          lastSeenReleaseVersion: version,
        })
      }
      return { previousProfile }
    },
    onError: (_error, _version, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile)
      }
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile)
    },
  })

  const markSeen = useCallback(
    (version: string) => {
      markReleaseNotesSeen(version)
    },
    [markReleaseNotesSeen]
  )

  return {
    lastSeenVersion: profileQuery.data?.lastSeenReleaseVersion,
    markSeen,
  }
}
