'use client';

import { apiPatch } from '@/src/config/api-client';
import { NOTIFICATIONS_QUERY_KEY } from '@/src/modules/notifications/hooks/use-notifications';
import { NOTIFICATIONS_UNREAD_QUERY_KEY } from '@/src/modules/notifications/hooks/use-unread-notification-count';
import type { NotificationRecord } from '@/src/modules/notifications/types/notification.types';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<NotificationRecord>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY }),
      ]);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPatch<{ updated: number }>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY }),
      ]);
    },
  });
}
