export const WALLET_VISIBLE_COUNT = 3

export function normalizeWalletOffset(offset: number, length: number): number {
  if (length <= 0) {
    return 0
  }
  return ((offset % length) + length) % length
}

export function walletFrontIndex(offset: number, length: number): number {
  return normalizeWalletOffset(offset, length)
}

export function walletOrderedItems<T>(
  items: readonly T[],
  offset: number
): T[] {
  if (items.length === 0) {
    return []
  }
  const start = normalizeWalletOffset(offset, items.length)
  return [...items.slice(start), ...items.slice(0, start)]
}

export function walletVisibleItems<T>(
  items: readonly T[],
  offset: number,
  max = WALLET_VISIBLE_COUNT
): T[] {
  return walletOrderedItems(items, offset).slice(0, Math.min(max, items.length))
}

export function walletPositionLabel(
  offset: number,
  length: number
): { current: number; total: number } {
  if (length <= 0) {
    return { current: 0, total: 0 }
  }
  return {
    current: walletFrontIndex(offset, length) + 1,
    total: length,
  }
}

export type WalletWrapDirection = "forward" | "backward"

/**
 * Direction of the bounce when a step leaves one end of the ring and returns on
 * the other. `null` while the step stays inside.
 */
export function walletWrapDirection(
  offset: number,
  delta: number,
  length: number
): WalletWrapDirection | null {
  if (length <= 1 || delta === 0) {
    return null
  }
  const front = walletFrontIndex(offset, length)
  if (delta > 0 && front === length - 1) {
    return "forward"
  }
  if (delta < 0 && front === 0) {
    return "backward"
  }
  return null
}

/** Offsets of the cards behind the front one in the stacked view. */
export const WALLET_STACK_STEP_X_PX = 12
export const WALLET_STACK_STEP_Y_PX = 22
export const WALLET_STACK_STEP_ROTATE_DEG = 3.5
export const WALLET_STACK_STEP_SCALE = 0.05
export const WALLET_STACK_STEP_OPACITY = 0.15

/** Space between two cards and from the edge of the container, deployed. */
export const WALLET_DECK_GAP_PX = 12
export const WALLET_DECK_GUTTER_PX = 16

/** The dragged card rises above the rest while the finger holds it. */
export const WALLET_DRAGGING_Z_INDEX = 80

const WALLET_STACK_Z_BASE = 30

export type WalletCardMotion = {
  x: number
  y: number
  rotate: number
  scale: number
  opacity: number
  zIndex: number
  /** The card can be pressed and dragged in its current position. */
  interactive: boolean
}

type WalletCardMotionInput = {
  /** Deployed row; `false` keeps the stack. */
  deployed: boolean
  index: number
  frontIndex: number
  total: number
  /** Width of the container that holds the cards; 0 before it is measured. */
  trackWidth: number
}

/**
 * Position of one card in one disposition. Both layouts share the same element,
 * so switching between them is a plain transform interpolation: the front card
 * stays where it is and the rest fan out or close in.
 */
export function walletCardMotion({
  deployed,
  index,
  frontIndex,
  total,
  trackWidth,
}: WalletCardMotionInput): WalletCardMotion {
  if (deployed) {
    const cardWidth = Math.max(trackWidth - WALLET_DECK_GUTTER_PX * 2, 0)
    const distance = index - frontIndex
    return {
      x: distance * (cardWidth + WALLET_DECK_GAP_PX),
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: WALLET_STACK_Z_BASE - Math.abs(distance),
      interactive: true,
    }
  }

  const position = normalizeWalletOffset(index - frontIndex, total)
  const visible = position < WALLET_VISIBLE_COUNT
  return {
    x: position * WALLET_STACK_STEP_X_PX,
    y: position * WALLET_STACK_STEP_Y_PX,
    rotate: position * WALLET_STACK_STEP_ROTATE_DEG,
    scale: 1 - position * WALLET_STACK_STEP_SCALE,
    opacity: visible ? 1 - position * WALLET_STACK_STEP_OPACITY : 0,
    zIndex: WALLET_STACK_Z_BASE - position,
    interactive: visible,
  }
}
