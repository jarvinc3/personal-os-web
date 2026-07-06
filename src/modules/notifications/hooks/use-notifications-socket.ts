'use client';

import { getSupabaseBrowserClient } from '@/src/config/supabase/client';
import { useNotificationPreferences } from '@/src/modules/notifications/hooks/use-notification-preferences';
import { NOTIFICATIONS_QUERY_KEY } from '@/src/modules/notifications/hooks/use-notifications';
import { NOTIFICATIONS_UNREAD_QUERY_KEY } from '@/src/modules/notifications/hooks/use-unread-notification-count';
import { showInAppNotificationToast } from '@/src/modules/notifications/lib/show-in-app-notification-toast';
import type { NotificationSocketPayload } from '@/src/modules/notifications/types/notification.types';
import { API_BASE_URL } from '@/src/shared/constants/api-endpoints';
import { useAppStore } from '@/src/shared/store/app-store';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

function resolveSocketUrl(): string {
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return base;
}

function isNotificationsRoute(pathname: string): boolean {
  return pathname.includes('/notifications');
}

export function useNotificationsSocket() {
  const session = useAppStore((state) => state.session);
  const queryClient = useQueryClient();
  const { isInAppEnabled } = useNotificationPreferences();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!session || !isInAppEnabled) {
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

      socket.on('notification.new', (payload: NotificationSocketPayload) => {
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });

        if (!isNotificationsRoute(pathnameRef.current)) {
          showInAppNotificationToast(payload);
        }
      });

      socketRef.current = socket;
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [session, isInAppEnabled, queryClient]);
}
