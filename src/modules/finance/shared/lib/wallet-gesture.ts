export const WALLET_CYCLE_MIN_OFFSET_PX = 70

export type WalletGestureKind = "press" | "cycle"

export function classifyWalletGesture(offsetY: number): WalletGestureKind {
  if (offsetY <= -WALLET_CYCLE_MIN_OFFSET_PX) {
    return "cycle"
  }
  return "press"
}

export function resetWalletGestureOffset(): number {
  return 0
}
