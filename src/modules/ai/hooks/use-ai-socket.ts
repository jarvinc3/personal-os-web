'use client';

import { getSupabaseBrowserClient } from '@/src/config/supabase/client';
import { AI_SESSIONS_QUERY_KEY } from '@/src/modules/ai/hooks/use-ai-sessions';
import { useAiSideEffects } from '@/src/modules/ai/hooks/use-ai-side-effects';
import type { AiResponseWsPayload } from '@/src/modules/ai/types/chat.types';
import { resolveNotificationsSocketUrl } from '@/src/modules/notifications/lib/notifications-socket-url';
import { appToast } from '@/src/shared/lib/app-toast';
import { useAppStore } from '@/src/shared/store/app-store';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

function isChatRoute(pathname: string): boolean {
  return pathname.includes('/chat');
}

export function useAiSocket() {
  const sessionUserId = useAppStore((state) => state.session?.userId ?? null);
  const sessionToken = useAppStore((state) => state.session?.token ?? null);
  const queryClient = useQueryClient();
  const applySideEffects = useAiSideEffects();
  const applySideEffectsRef = useRef(applySideEffects);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    applySideEffectsRef.current = applySideEffects;
  }, [applySideEffects]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && sessionToken) {
      socket.auth = { token: sessionToken };
    }
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionUserId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;
    let socket: Socket | null = null;

    void (async () => {
      const {
        data: { session: authSession },
      } = await getSupabaseBrowserClient().auth.getSession();
      const token = authSession?.access_token;
      if (!token || cancelled) {
        return;
      }

      socket = io(`${resolveNotificationsSocketUrl()}/notifications`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('ai.response', (payload: AiResponseWsPayload) => {
        if (payload.sideEffects?.length) {
          void applySideEffectsRef.current(payload.sideEffects);
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
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [sessionUserId, queryClient]);
}
