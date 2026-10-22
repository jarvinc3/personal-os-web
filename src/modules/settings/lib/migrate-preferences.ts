import {
  DEFAULT_APPEARANCE_STYLE,
  DEFAULT_PRIMARY_COLOR,
  isAppearanceStyleId,
  normalizeHexColor,
} from "@/src/shared/appearance"
import type { UserPreferences } from "@/src/modules/settings/types/profile.types"

/** Versión del bloque de preferencias globales del perfil. */
export const USER_PREFERENCES_VERSION = 2

/**
 * Las preferencias anteriores a la v2 no tienen estilo ni color primario.
 * Se completan una vez y se guardan con la versión nueva en el siguiente PATCH.
 */
export function migrateUserPreferences(
  preferences: UserPreferences
): UserPreferences {
  const style = isAppearanceStyleId(preferences.theme.style)
    ? preferences.theme.style
    : DEFAULT_APPEARANCE_STYLE
  const primaryColor =
    normalizeHexColor(preferences.theme.primaryColor) ?? DEFAULT_PRIMARY_COLOR

  if (
    preferences.version === USER_PREFERENCES_VERSION &&
    preferences.theme.style === style &&
    preferences.theme.primaryColor === primaryColor
  ) {
    return preferences
  }

  return {
    ...preferences,
    version: USER_PREFERENCES_VERSION,
    theme: {
      ...preferences.theme,
      style,
      primaryColor,
    },
  }
}
