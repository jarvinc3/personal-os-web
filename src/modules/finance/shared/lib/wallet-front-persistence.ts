import type { InstitutionStackItem } from "./institution-stack.ts"

export const WALLET_FRONT_ITEM_STORAGE_KEY = "finance.wallet.frontItemKey"

export function stackItemKey(
  item: Pick<InstitutionStackItem, "kind" | "id">
): string {
  return `${item.kind}:${item.id}`
}

export function cycleOffsetForFrontKey(
  items: readonly Pick<InstitutionStackItem, "kind" | "id">[],
  key: string | null
): number {
  if (!key || items.length === 0) {
    return 0
  }
  const index = items.findIndex((item) => stackItemKey(item) === key)
  return index >= 0 ? index : 0
}

export function readFrontItemKey(
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined"
    ? window.sessionStorage
    : null
): string | null {
  if (!storage) {
    return null
  }
  try {
    return storage.getItem(WALLET_FRONT_ITEM_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeFrontItemKey(
  key: string,
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined"
    ? window.sessionStorage
    : null
): void {
  if (!storage) {
    return
  }
  try {
    storage.setItem(WALLET_FRONT_ITEM_STORAGE_KEY, key)
  } catch {
    // Ignore quota / private-mode failures; front card stays in-memory only.
  }
}
