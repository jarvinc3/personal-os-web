import { normalizeUserPreferences } from "@/src/modules/settings/lib/normalize-preferences"
import { mergeWithDefaults } from "@/src/modules/settings/lib/settings-value"
import type {
  DeepPartial,
  UserPreferences,
} from "@/src/modules/settings/types/profile.types"

/** Deep-merges a preference patch over the normalized current values. */
export function mergeUserPreferences(
  current: UserPreferences | null | undefined,
  patch: DeepPartial<UserPreferences>
): UserPreferences {
  const normalized = normalizeUserPreferences(current)
  return mergeWithDefaults(
    patch as Record<string, unknown>,
    normalized as unknown as Record<string, unknown>
  ) as UserPreferences
}
