export const WALLET_TAP_MAX_OFFSET_PX = 16
export const WALLET_CYCLE_MIN_OFFSET_PX = 70

export type WalletGestureKind = "press" | "cycle" | "none"

export function classifyWalletGesture(offsetY: number): WalletGestureKind {
  if (offsetY <= -WALLET_CYCLE_MIN_OFFSET_PX) {
    return "cycle"
  }
  if (Math.abs(offsetY) <= WALLET_TAP_MAX_OFFSET_PX) {
    return "press"
  }
  return "none"
}

export function resetWalletGestureOffset(): number {
  return 0
}
