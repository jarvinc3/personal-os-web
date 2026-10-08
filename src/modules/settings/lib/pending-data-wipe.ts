import { isWipeLayerId, type WipeLayerId } from "./wipe-layers"

export const PENDING_DATA_WIPE_KEY = "pendingDataWipe"

export function setPendingDataWipe(layers: readonly WipeLayerId[]) {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.setItem(PENDING_DATA_WIPE_KEY, layers.join(","))
}

export function readPendingDataWipe(): WipeLayerId[] | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = sessionStorage.getItem(PENDING_DATA_WIPE_KEY)
  if (!raw) {
    return null
  }
  const layers = raw.split(",").filter(isWipeLayerId)
  return layers.length > 0 ? layers : null
}

export function clearPendingDataWipe() {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.removeItem(PENDING_DATA_WIPE_KEY)
}
