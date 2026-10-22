import {
  getPrimaryColorTokens,
  normalizeHexColor,
} from "@/src/shared/appearance/color"
import type { AppearancePreference } from "@/src/shared/appearance/appearance.types"
import type { AppearanceStyleId } from "@/src/shared/appearance/style-registry"

export const APPEARANCE_STORAGE_KEY = "personal-os-appearance"
export const APPEARANCE_CACHE_VERSION = 1

type CachedAppearance = {
  version: number
  style: AppearanceStyleId
  primaryColor: string
  primaryForeground: string
}

type StorageReader = Pick<Storage, "getItem">
type StorageWriter = Pick<Storage, "setItem">

export function parseCachedAppearance(
  raw: string | null,
  isKnownStyle: (value: unknown) => value is AppearanceStyleId
): AppearancePreference | null {
  if (!raw) {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Una caché corrupta no es un fallo de la app: se resuelve desde el perfil.
      return null
    }
    throw error
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null
  }

  const cached = parsed as Record<string, unknown>
  if (cached.version !== APPEARANCE_CACHE_VERSION) {
    return null
  }
  if (!isKnownStyle(cached.style)) {
    return null
  }

  const primaryColor = normalizeHexColor(cached.primaryColor)
  if (!primaryColor) {
    return null
  }

  return { style: cached.style, primaryColor }
}

export function serializeCachedAppearance(
  appearance: AppearancePreference
): string {
  const tokens = getPrimaryColorTokens(appearance.primaryColor)
  const cached: CachedAppearance = {
    version: APPEARANCE_CACHE_VERSION,
    style: appearance.style,
    primaryColor: tokens.primary,
    primaryForeground: tokens.primaryForeground,
  }

  return JSON.stringify(cached)
}

export function readCachedAppearance(
  storage: StorageReader,
  isKnownStyle: (value: unknown) => value is AppearanceStyleId
): AppearancePreference | null {
  return parseCachedAppearance(
    storage.getItem(APPEARANCE_STORAGE_KEY),
    isKnownStyle
  )
}

export function writeCachedAppearance(
  storage: StorageWriter,
  appearance: AppearancePreference
): void {
  storage.setItem(APPEARANCE_STORAGE_KEY, serializeCachedAppearance(appearance))
}
