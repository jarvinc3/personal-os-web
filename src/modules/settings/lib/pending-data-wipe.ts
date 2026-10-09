import { isWipeLayerId, type WipeLayerId } from "./wipe-layers"

export const PENDING_DATA_WIPE_KEY = "pendingDataWipe"

export type PendingDataWipe = {
  layers: WipeLayerId[]
  balanceInstitutionId?: string
}

export function setPendingDataWipe(pending: PendingDataWipe) {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.setItem(PENDING_DATA_WIPE_KEY, JSON.stringify(pending))
}

export function readPendingDataWipe(): PendingDataWipe | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = sessionStorage.getItem(PENDING_DATA_WIPE_KEY)
  if (!raw) {
    return null
  }
  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as {
        layers?: unknown
        balanceInstitutionId?: unknown
      }
      const layers = Array.isArray(parsed.layers)
        ? parsed.layers.filter(isWipeLayerId)
        : []
      if (layers.length === 0) {
        return null
      }
      return {
        layers,
        balanceInstitutionId:
          typeof parsed.balanceInstitutionId === "string"
            ? parsed.balanceInstitutionId
            : undefined,
      }
    } catch {
      return null
    }
  }
  const layers = raw.split(",").filter(isWipeLayerId)
  return layers.length > 0 ? { layers } : null
}

export function clearPendingDataWipe() {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.removeItem(PENDING_DATA_WIPE_KEY)
}
