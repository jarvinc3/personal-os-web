import type { NotificationRecord } from '@/src/modules/notifications/types/notification.types';
import { SETTINGS_REGISTRY } from '@/src/modules/settings/constants/settings-metadata';
import {
  getModuleNotificationVisual,
  parseModuleSlugFromNotificationData,
} from '@/src/shared/constants/module-registry';
import { Bell, type LucideIcon } from 'lucide-react';

export type NotificationVisual = {
  icon: LucideIcon;
  accent: string;
  bgClass: string;
};

const DEFAULT_NOTIFICATION_VISUAL: NotificationVisual = {
  icon: Bell,
  accent: SETTINGS_REGISTRY.notifications.accent,
  bgClass: `${SETTINGS_REGISTRY.notifications.accent}/10`,
};

export function getNotificationVisual(notification: NotificationRecord): NotificationVisual {
  const moduleSlug = parseModuleSlugFromNotificationData(notification.data);
  if (moduleSlug) {
    const moduleVisual = getModuleNotificationVisual(moduleSlug);
    return {
      icon: moduleVisual.icon,
      accent: moduleVisual.accent,
      bgClass: moduleVisual.bgClass,
    };
  }
  return DEFAULT_NOTIFICATION_VISUAL;
}
