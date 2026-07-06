'use client';

import { getSupabaseBrowserClient } from '@/src/config/supabase/client';
import { AI_SESSIONS_QUERY_KEY } from '@/src/modules/ai/hooks/use-ai-sessions';
import { useAiSideEffects } from '@/src/modules/ai/hooks/use-ai-side-effects';
import type { AiResponseWsPayload } from '@/src/modules/ai/types/chat.types';
import { API_BASE_URL } from '@/src/shared/constants/api-endpoints';
import { appToast } from '@/src/shared/lib/app-toast';
import { useAppStore } from '@/src/shared/store/app-store';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

function resolveSocketUrl(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

function isChatRoute(pathname: string): boolean {
  return pathname.includes('/chat');
}

export function useAiSocket() {
  const session = useAppStore((state) => state.session);
  const queryClient = useQueryClient();
  const applySideEffects = useAiSideEffects();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!session) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      const {
        data: { session: authSession },
      } = await getSupabaseBrowserClient().auth.getSession();
      const token = authSession?.access_token;
      if (!token || cancelled) {
        return;
      }

      const socket = io(`${resolveSocketUrl()}/notifications`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('ai.response', (payload: AiResponseWsPayload) => {
        if (payload.sideEffects?.length) {
          void applySideEffects(payload.sideEffects);
        }

        if (payload.type === 'insight' && payload.content && !isChatRoute(pathnameRef.current)) {
          appToast.info({
            text1: 'Insight del agente',
            text2: payload.content.slice(0, 120),
          });
        }

        if (
          payload.type === 'chat.complete' ||
          payload.type === 'action.updated'
        ) {
          void queryClient.invalidateQueries({ queryKey: AI_SESSIONS_QUERY_KEY });
          if (payload.sessionId) {
            void queryClient.invalidateQueries({
              queryKey: ['ai', 'session', payload.sessionId],
            });
          }
        }
      });

      socketRef.current = socket;
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [session, queryClient, applySideEffects]);
}
