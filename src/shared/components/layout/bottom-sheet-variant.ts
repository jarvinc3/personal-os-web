export type BottomSheetVariant = "default" | "floating"

export function getBottomSheetDirection(
  variant: BottomSheetVariant,
  isMobile: boolean
): "bottom" | "right" {
  if (variant === "floating") return "bottom"
  return isMobile ? "bottom" : "right"
}

export const FLOATING_SHEET_CONTENT_CLASS =
  "mx-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-xl border data-[vaul-drawer-direction=bottom]:bottom-4 data-[vaul-drawer-direction=bottom]:rounded-xl"
