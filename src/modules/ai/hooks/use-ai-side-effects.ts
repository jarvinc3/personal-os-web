'use client';

import type {
  ModuleChatSlug,
  SideEffectDescriptor,
} from '@/src/modules/ai/types/chat.types';
import { parseModuleChatSlug } from '@/src/modules/ai/types/chat.types';
import { PROFILE_QUERY_KEY } from '@/src/modules/auth/lib/hydrate-auth-user';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

export function useAiSideEffects(
  onModuleContext?: (slug: ModuleChatSlug, label: string) => void,
) {
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  return useCallback(
    async (effects?: SideEffectDescriptor[]) => {
      if (!effects?.length) {
        return;
      }

      for (const effect of effects) {
        if (effect.type === 'invalidate') {
          await queryClient.invalidateQueries({
            queryKey: effect.keys,
          });
        }
        if (effect.type === 'theme') {
          setTheme(effect.value);
          await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        }
        if (effect.type === 'moduleContext') {
          onModuleContext?.(parseModuleChatSlug(effect.slug), effect.label);
        }
      }
    },
    [onModuleContext, queryClient, setTheme],
  );
}
