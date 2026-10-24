"use client"

import { apiGet, apiPatch } from "@/src/config/api-client"
import type {
  AiRole,
  AiRoleRow,
} from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const AI_ROLES_QUERY_KEY = ["intelligence", "roles"] as const

export function useAiRoles() {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const rolesQuery = useQuery({
    queryKey: AI_ROLES_QUERY_KEY,
    queryFn: ({ signal }) =>
      apiGet<AiRoleRow[]>(API_ENDPOINTS.INTELLIGENCE.ROLES, signal),
    enabled: Boolean(session),
  })
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AiRole }) =>
      apiPatch(API_ENDPOINTS.INTELLIGENCE.ROLE(userId), { role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AI_ROLES_QUERY_KEY })
      await queryClient.invalidateQueries({ queryKey: ["intelligence"] })
      appToast.success({ text1: "Rol actualizado" })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo actualizar el rol",
        text2: error.message,
      })
    },
  })
  return { rolesQuery, updateRoleMutation }
}
