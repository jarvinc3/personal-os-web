export {
  applyAppearanceToDocument,
  applyPrimaryColorToDocument,
  applyStyleToDocument,
} from "@/src/shared/appearance/apply-appearance"
export {
  APPEARANCE_CACHE_VERSION,
  APPEARANCE_STORAGE_KEY,
  parseCachedAppearance,
  readCachedAppearance,
  serializeCachedAppearance,
  writeCachedAppearance,
} from "@/src/shared/appearance/appearance-cache"
export { APPEARANCE_SCRIPT } from "@/src/shared/appearance/appearance-script"
export type { AppearancePreference } from "@/src/shared/appearance/appearance.types"
export {
  BLACK_TEXT,
  contrastRatio,
  getPrimaryColorTokens,
  normalizeHexColor,
  readableTextColor,
  relativeLuminance,
  WHITE_TEXT,
} from "@/src/shared/appearance/color"
export {
  DEFAULT_PRIMARY_COLOR,
  findPrimaryColor,
  PRIMARY_COLORS,
} from "@/src/shared/appearance/primary-colors"
export type { PrimaryColorOption } from "@/src/shared/appearance/primary-colors"
export {
  APPEARANCE_STYLES,
  DEFAULT_APPEARANCE_STYLE,
  findAppearanceStyle,
  isAppearanceStyleId,
} from "@/src/shared/appearance/style-registry"
export type {
  AppearanceStyle,
  AppearanceStyleId,
} from "@/src/shared/appearance/style-registry"
