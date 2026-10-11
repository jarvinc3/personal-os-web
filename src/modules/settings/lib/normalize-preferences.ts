import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"
import { mergeWithDefaults } from "@/src/modules/settings/lib/settings-value"
import type { UserPreferences } from "@/src/modules/settings/types/profile.types"

function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0
  )
}

export function normalizeUserPreferences(
  raw: UserPreferences | Record<string, unknown> | null | undefined
): UserPreferences {
  if (raw === null || raw === undefined || isEmptyObject(raw)) {
    return mergeWithDefaults(
      null,
      DEFAULT_USER_PREFERENCES as unknown as Record<string, unknown>
    ) as UserPreferences
  }

  return mergeWithDefaults(
    raw as Record<string, unknown>,
    DEFAULT_USER_PREFERENCES as unknown as Record<string, unknown>
  ) as UserPreferences
}
