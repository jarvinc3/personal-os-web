export const WALLET_VISIBLE_COUNT = 3

export function normalizeWalletOffset(offset: number, length: number): number {
  if (length <= 0) return 0
  return ((offset % length) + length) % length
}

export function walletFrontIndex(offset: number, length: number): number {
  return normalizeWalletOffset(offset, length)
}

export function walletOrderedItems<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return []
  const start = normalizeWalletOffset(offset, items.length)
  return [...items.slice(start), ...items.slice(0, start)]
}

export function walletVisibleItems<T>(
  items: readonly T[],
  offset: number,
  max = WALLET_VISIBLE_COUNT,
): T[] {
  return walletOrderedItems(items, offset).slice(
    0,
    Math.min(max, items.length),
  )
}

export function walletPositionLabel(
  offset: number,
  length: number,
): { current: number; total: number } {
  if (length <= 0) return { current: 0, total: 0 }
  return {
    current: walletFrontIndex(offset, length) + 1,
    total: length,
  }
}
