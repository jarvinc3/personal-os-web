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

type ActionMutationInput = {
  actionId: string;
  sessionId?: string | null;
};

async function invalidateActionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionId?: string | null,
) {
  await queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY });
  if (sessionId) {
    await queryClient.invalidateQueries({ queryKey: ['ai', 'session', sessionId] });
  }
}

export function useExecuteAiAction(sessionId?: string | null) {
  const queryClient = useQueryClient();
  const applySideEffects = useAiSideEffects();

  return useMutation({
    mutationFn: ({ actionId }: ActionMutationInput) =>
      apiPost<ActionResult>(API_ENDPOINTS.AI.ACTION_EXECUTE(actionId), {}),
    onSuccess: async (data, variables) => {
      await applySideEffects(data.sideEffects as never);
      await invalidateActionQueries(
        queryClient,
        variables.sessionId ?? sessionId,
      );
    },
  });
}

export function useCancelAiAction(sessionId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId }: ActionMutationInput) =>
      apiPost<AiActionSummary>(API_ENDPOINTS.AI.ACTION_CANCEL(actionId), {}),
    onSuccess: async (_data, variables) => {
      await invalidateActionQueries(
        queryClient,
        variables.sessionId ?? sessionId,
      );
    },
  });
}
