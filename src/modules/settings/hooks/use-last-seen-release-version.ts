"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"

export function useLastSeenReleaseVersion(): string | null | undefined {
  const { profileQuery } = useProfile()

  return profileQuery.data?.lastSeenReleaseVersion
}
