import { getPrimaryColorTokens } from "@/src/shared/appearance/color"
import type { AppearancePreference } from "@/src/shared/appearance/appearance.types"
import type { AppearanceStyleId } from "@/src/shared/appearance/style-registry"

export function applyStyleToDocument(style: AppearanceStyleId): void {
  document.documentElement.setAttribute("data-style", style)
}

export function applyPrimaryColorToDocument(primaryColor: string): void {
  const tokens = getPrimaryColorTokens(primaryColor)
  const root = document.documentElement
  root.style.setProperty("--primary", tokens.primary)
  root.style.setProperty("--primary-foreground", tokens.primaryForeground)
  root.style.setProperty("--ring", tokens.ring)
}

export function applyAppearanceToDocument(
  appearance: AppearancePreference
): void {
  applyStyleToDocument(appearance.style)
  applyPrimaryColorToDocument(appearance.primaryColor)
}
