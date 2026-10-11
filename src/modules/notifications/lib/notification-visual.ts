import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"
import { SETTINGS_REGISTRY } from "@/src/modules/settings"
import {
  getModuleNotificationVisual,
  parseModuleSlugFromNotificationData,
} from "@/src/shared/constants/module-registry"
import { Bell, type LucideIcon } from "lucide-react"

export type NotificationVisual = {
  icon: LucideIcon | null
  emoji: string | null
  accent: string
}

const DEFAULT_NOTIFICATION_VISUAL: NotificationVisual = {
  icon: Bell,
  emoji: null,
  accent: SETTINGS_REGISTRY.notifications.accent,
}

type CategoryVisual = {
  emoji: string
  color: string
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function readCategoryVisual(
  notificationData: Record<string, unknown> | null | undefined
): CategoryVisual | null {
  const emoji = readNonEmptyString(notificationData?.categoryIcon)
  const color = readNonEmptyString(notificationData?.categoryColor)
  if (!emoji || !color) {
    return null
  }
  return { emoji, color }
}

export function getNotificationVisual(
  notification: NotificationRecord
): NotificationVisual {
  const category = readCategoryVisual(notification.data)
  if (category) {
    return {
      icon: null,
      emoji: category.emoji,
      accent: category.color,
    }
  }

  const moduleSlug = parseModuleSlugFromNotificationData(notification.data)
  if (moduleSlug) {
    const moduleVisual = getModuleNotificationVisual(moduleSlug)
    return {
      icon: moduleVisual.icon,
      emoji: null,
      accent: moduleVisual.accent,
    }
  }

  return DEFAULT_NOTIFICATION_VISUAL
}
