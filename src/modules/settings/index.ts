export { SettingsGate } from "@/src/modules/settings/settings-gate"
export { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
export { EditQuietHoursSheet } from "@/src/modules/settings/components/sheets/edit-quiet-hours-sheet"
export { WipeDataSheet } from "@/src/modules/settings/components/sheets/wipe-data-sheet"
export { normalizeUserPreferences } from "@/src/modules/settings/lib/normalize-preferences"
export { isWithinQuietHours } from "@/src/modules/settings/lib/quiet-hours"
export type {
  NotificationChannelPreferences,
  NotificationsPreference,
  QuietHoursPreference,
  UserProfile,
} from "@/src/modules/settings/types/profile.types"
export type { ModuleSlug } from "@/src/modules/settings/types/module-config.types"
export { PendingAccountDeletionHandler } from "@/src/modules/settings/components/pending-account-deletion-handler"
export { PendingDataWipeHandler } from "@/src/modules/settings/components/pending-data-wipe-handler"
export { ReleaseNotes } from "@/src/modules/settings/components/release-notes"
export { useApplyThemePreference } from "@/src/modules/settings/hooks/use-apply-theme-preference"
export { useApplyAppearancePreference } from "@/src/modules/settings/hooks/use-apply-appearance-preference"
export { useDeleteAccount } from "@/src/modules/settings/hooks/use-delete-account"
export { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
export { useModuleSheetNav } from "@/src/modules/settings/hooks/use-module-sheet-nav"
export { mergeUserPreferences } from "@/src/modules/settings/lib/merge-user-preferences"
export { useProfile } from "@/src/modules/settings/hooks/use-profile"
export { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
export { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
export { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
