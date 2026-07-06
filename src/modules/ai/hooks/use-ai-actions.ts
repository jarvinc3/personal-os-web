'use client';

import { apiPost } from '@/src/config/api-client';
import { AI_SESSIONS_QUERY_KEY } from '@/src/modules/ai/hooks/use-ai-sessions';
import { useAiSideEffects } from '@/src/modules/ai/hooks/use-ai-side-effects';
import type { AiActionSummary } from '@/src/modules/ai/types/chat.types';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ActionResult = {
  action: AiActionSummary;
  sideEffects?: { type: string; keys?: string[]; value?: string }[];
};

export function useExecuteAiAction() {
  const queryClient = useQueryClient();
  const applySideEffects = useAiSideEffects();

  return useMutation({
    mutationFn: (actionId: string) =>
      apiPost<ActionResult>(API_ENDPOINTS.AI.ACTION_EXECUTE(actionId), {}),
    onSuccess: async (data) => {
      await applySideEffects(data.sideEffects as never);
      await queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY });
    },
  });
}

export function useCancelAiAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actionId: string) =>
      apiPost<AiActionSummary>(API_ENDPOINTS.AI.ACTION_CANCEL(actionId), {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY });
    },
  });
}
