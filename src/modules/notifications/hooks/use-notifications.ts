'use client';

import { apiGet } from '@/src/config/api-client';
import type { PaginatedNotifications } from '@/src/modules/notifications/types/notification.types';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';
import { useAppStore } from '@/src/shared/store/app-store';
import { useQuery } from '@tanstack/react-query';

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'list'] as const;

export function useNotifications(options?: { unreadOnly?: boolean }) {
  const session = useAppStore((state) => state.session);

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, options?.unreadOnly ?? false],
    queryFn: () => {
      const params = new URLSearchParams({
        channel: 'IN_APP',
        page: '1',
        limit: '50',
      });
      if (options?.unreadOnly) {
        params.set('unreadOnly', 'true');
      }
      return apiGet<PaginatedNotifications>(
        `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`,
      );
    },
    enabled: Boolean(session),
    staleTime: 1000 * 15,
  });
}
