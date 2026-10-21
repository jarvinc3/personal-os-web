export const WALLET_CYCLE_MIN_OFFSET_PX = 70

/** Movement under this many pixels is still a tap on the front card. */
export const WALLET_TAP_SLOP_PX = 8

/** Swipe left advances the stack; swipe right goes back. */
export type WalletGestureKind = "press" | "next" | "previous"

export function classifyWalletGesture(offsetX: number): WalletGestureKind {
  if (offsetX <= -WALLET_CYCLE_MIN_OFFSET_PX) {
    return "next"
  }
  if (offsetX >= WALLET_CYCLE_MIN_OFFSET_PX) {
    return "previous"
  }
  return "press"
}

/** Steps the stack by the direction of the gesture; a press does not move it. */
export function walletGestureDelta(kind: WalletGestureKind): number {
  if (kind === "next") {
    return 1
  }
  if (kind === "previous") {
    return -1
  }
  return 0
}

/**
 * A drag past the tap slop stays a drag: the click the browser fires when the
 * pointer lifts must be dropped, and the tap after it opens the card again.
 */
export function isWalletDragOnly(offsetX: number): boolean {
  return Math.abs(offsetX) > WALLET_TAP_SLOP_PX
}
