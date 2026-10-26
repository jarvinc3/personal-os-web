"use client"

import {
  ApiError,
  apiDeleteWithBody,
  apiGet,
  apiPost,
} from "@/src/config/api-client"
import { downloadJson } from "@/src/modules/intelligence/knowledge-download"
import { knowledgeExportFilename } from "@/src/modules/intelligence/knowledge"
import type {
  KnowledgeDeletion,
  KnowledgeExplorer,
  KnowledgeExport,
  KnowledgeItem,
} from "@/src/modules/intelligence/types/knowledge.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const KNOWLEDGE_QUERY_KEY = ["intelligence", "knowledge"] as const
export const KNOWLEDGE_ADMIN_QUEUE_QUERY_KEY = [
  "intelligence",
  "knowledge",
  "admin-queue",
] as const

const INTELLIGENCE_NAMESPACE_QUERY_KEY = ["intelligence"] as const

function shouldRetryKnowledgeQuery(
  failureCount: number,
  error: unknown
): boolean {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  ) {
    return false
  }
  return failureCount < 2
}

export function useKnowledge() {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: KNOWLEDGE_QUERY_KEY,
    queryFn: ({ signal }) =>
      apiGet<KnowledgeExplorer>(API_ENDPOINTS.INTELLIGENCE.KNOWLEDGE, signal),
    enabled: Boolean(session),
    retry: shouldRetryKnowledgeQuery,
  })
}

export function useKnowledgeAdminQueue() {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: KNOWLEDGE_ADMIN_QUEUE_QUERY_KEY,
    queryFn: ({ signal }) =>
      apiGet<KnowledgeItem[]>(
        API_ENDPOINTS.INTELLIGENCE.KNOWLEDGE_ADMIN_QUEUE,
        signal
      ),
    enabled: Boolean(session),
    retry: shouldRetryKnowledgeQuery,
  })
}

export function useExportKnowledge() {
  return useMutation({
    mutationFn: () =>
      apiGet<KnowledgeExport>(API_ENDPOINTS.INTELLIGENCE.KNOWLEDGE_EXPORT),
    onSuccess: (knowledgeExport) => {
      downloadJson({
        filename: knowledgeExportFilename(knowledgeExport.exportedAt),
        payload: {
          exportedAt: knowledgeExport.exportedAt,
          knowledge: knowledgeExport.knowledge,
        },
      })
      appToast.success({
        text1: "Conocimiento exportado",
        text2: `${knowledgeExport.knowledge.length} ítems en el archivo.`,
      })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo exportar el conocimiento",
        text2: error.message,
      })
    },
  })
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiDeleteWithBody<KnowledgeDeletion>(
        API_ENDPOINTS.INTELLIGENCE.KNOWLEDGE_DELETE,
        { confirmed: true }
      ),
    onSuccess: async (deletion) => {
      appToast.success({
        text1: "Datos de IA borrados",
        text2: `${deletion.deletedMessages} ${
          deletion.deletedMessages === 1 ? "correo" : "correos"
        }, ${deletion.detachedVerifications} ${
          deletion.detachedVerifications === 1
            ? "verificación anonimizada"
            : "verificaciones anonimizadas"
        } y ${deletion.detachedObservations} ${
          deletion.detachedObservations === 1
            ? "observación anonimizada"
            : "observaciones anonimizadas"
        }. Gmail quedó desconectado.`,
      })
      await queryClient.invalidateQueries({
        queryKey: INTELLIGENCE_NAMESPACE_QUERY_KEY,
      })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudieron borrar los datos de IA",
        text2: error.message,
      })
    },
  })
}

export function useRevertKnowledge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (knowledgeId: string) =>
      apiPost<KnowledgeItem>(
        API_ENDPOINTS.INTELLIGENCE.KNOWLEDGE_REVERT(knowledgeId)
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: KNOWLEDGE_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: KNOWLEDGE_ADMIN_QUEUE_QUERY_KEY,
        }),
      ])
      appToast.success({
        text1: "Promoción revertida",
        text2: "Quedó bloqueada y no se aplicará a los usuarios.",
      })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo revertir",
        text2:
          error instanceof ApiError && error.status === 404
            ? "Ese conocimiento ya no existe."
            : error.message,
      })
    },
  })
}
