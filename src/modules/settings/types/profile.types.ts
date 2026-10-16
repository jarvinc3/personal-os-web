import type { UserModuleEntry } from "@/src/modules/settings/types/module-config.types"

export type ThemeValue = "system" | "light" | "dark"

export type ThemePreference = {
  fieldGuide: string
  value: ThemeValue
}

export type OnboardingPreference = {
  fieldGuide: string
  completed: boolean
}

export type AITone = "concise" | "detailed" | "balanced"

export type AIPreferences = {
  fieldGuide: string
  tone: AITone
  proactiveInsights: boolean
  confirmBeforeActions: boolean
  defaultProvider: string | null
}

export type NotificationChannelPreferences = {
  push: boolean
  email: boolean
  inApp: boolean
}

export type QuietHoursPreference = {
  enabled: boolean
  start: string
  end: string
  timezone: string | null
}

export type NotificationsPreference = {
  fieldGuide: string
  channels: NotificationChannelPreferences
  quietHours: QuietHoursPreference
}

export type PrivacyPreference = {
  fieldGuide: string
  analyticsEnabled: boolean
  crashReportsEnabled: boolean
}

export type UserPreferences = {
  version: number
  theme: ThemePreference
  onboarding: OnboardingPreference
  ai: AIPreferences
  notifications: NotificationsPreference
  privacy: PrivacyPreference
}

export { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"

export type UserProfile = {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  timezone: string | null
  locale: string | null
  preferences: UserPreferences | null
  lastSeenReleaseVersion: string | null
  userModules?: UserModuleEntry[]
  createdAt: string
  updatedAt: string
}

export type UpdateProfilePayload = {
  fullName?: string
  timezone?: string
  locale?: string
  avatarUrl?: string
  preferences?: UserPreferences
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export type SettingsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}
