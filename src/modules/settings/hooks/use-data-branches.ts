"use client"

import { apiGet } from "@/src/config/api-client"
import type { DataAppBranches } from "@/src/modules/settings/types/wipe.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQuery } from "@tanstack/react-query"

export const DATA_BRANCHES_QUERY_KEY = ["users", "data-branches"] as const

/** Branches and counts the back offers today; the client never invents them. */
export function useDataBranches(enabled = true) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: DATA_BRANCHES_QUERY_KEY,
    queryFn: () => apiGet<DataAppBranches[]>(API_ENDPOINTS.USERS.DATA_BRANCHES),
    enabled: enabled && Boolean(session),
  })
}
