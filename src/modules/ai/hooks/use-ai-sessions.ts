'use client';

import { apiDelete, apiGet, apiPost } from '@/src/config/api-client';
import type { AiSessionDetail, ModuleChatSlug, PaginatedAiSessions } from '@/src/modules/ai/types/chat.types';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';
import { useAppStore } from '@/src/shared/store/app-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const AI_SESSIONS_QUERY_KEY = ['ai', 'sessions'] as const;

export function useAiSessions() {
  const session = useAppStore((state) => state.session);

  return useQuery({
    queryKey: AI_SESSIONS_QUERY_KEY,
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', limit: '30' });
      return apiGet<PaginatedAiSessions>(
        `${API_ENDPOINTS.AI.SESSIONS}?${params.toString()}`,
      );
    },
    enabled: Boolean(session),
  });
}

export function useAiSession(sessionId: string | null) {
  const session = useAppStore((state) => state.session);

  return useQuery({
    queryKey: ['ai', 'session', sessionId],
    queryFn: () => apiGet<AiSessionDetail>(API_ENDPOINTS.AI.SESSION(sessionId!)),
    enabled: Boolean(session) && Boolean(sessionId),
  });
}

export function useCreateAiSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: { moduleSlug?: ModuleChatSlug | string }) =>
      apiPost<AiSessionDetail>(API_ENDPOINTS.AI.SESSIONS, {
        moduleSlug: input?.moduleSlug && input.moduleSlug !== 'general'
          ? input.moduleSlug
          : undefined,
        contextType: input?.moduleSlug ?? 'general',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY });
    },
  });
}

export function useDeleteAiSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiDelete(API_ENDPOINTS.AI.SESSION(sessionId)),
    onSuccess: async (_data, sessionId) => {
      queryClient.removeQueries({ queryKey: ['ai', 'session', sessionId] });
      await queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY });
    },
  });
}
