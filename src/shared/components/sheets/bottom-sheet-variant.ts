export type BottomSheetVariant = "default" | "floating"

export function getBottomSheetDirection(
  variant: BottomSheetVariant,
  isMobile: boolean
): "down" | "right" {
  if (variant === "floating") {
    return "down"
  }
  return isMobile ? "down" : "right"
}

export type BottomSheetSize = "default" | "wide"

/**
 * `wide` only changes the right drawer: below `md` the width stays the default
 * one, and from `md` up it takes room for a preview beside the form.
 */
export const WIDE_SHEET_CONTENT_CLASS =
  "data-[swipe-direction=right]:md:max-w-2xl"

export const FLOATING_SHEET_CONTENT_CLASS =
  "mx-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-xl border data-[swipe-direction=down]:bottom-4 data-[swipe-direction=down]:rounded-xl"
