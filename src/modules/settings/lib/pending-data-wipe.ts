export const PENDING_DATA_WIPE_KEY = "pendingDataWipe"

export type PendingDataWipeBranch = {
  id: string
  label: string
  count: number
}

export type PendingDataWipe = {
  branches: PendingDataWipeBranch[]
  balanceInstitutionId?: string
}

export function setPendingDataWipe(pending: PendingDataWipe): void {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.setItem(PENDING_DATA_WIPE_KEY, JSON.stringify(pending))
}

function parseBranch(value: unknown): PendingDataWipeBranch | null {
  if (typeof value !== "object" || value === null) {
    return null
  }
  const branch = value as Record<string, unknown>
  if (
    typeof branch.id !== "string" ||
    typeof branch.label !== "string" ||
    typeof branch.count !== "number"
  ) {
    return null
  }
  return { id: branch.id, label: branch.label, count: branch.count }
}

export function readPendingDataWipe(): PendingDataWipe | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = sessionStorage.getItem(PENDING_DATA_WIPE_KEY)
  if (!raw) {
    return null
  }

  let parsed: { branches?: unknown; balanceInstitutionId?: unknown }
  try {
    parsed = JSON.parse(raw) as {
      branches?: unknown
      balanceInstitutionId?: unknown
    }
  } catch {
    // A stale or hand-edited value is not a pending wipe: nothing to confirm.
    return null
  }

  const branches = Array.isArray(parsed.branches)
    ? parsed.branches.flatMap((value) => {
        const branch = parseBranch(value)
        return branch ? [branch] : []
      })
    : []
  if (branches.length === 0) {
    return null
  }

  return {
    branches,
    ...(typeof parsed.balanceInstitutionId === "string"
      ? { balanceInstitutionId: parsed.balanceInstitutionId }
      : {}),
  }
}

export function clearPendingDataWipe(): void {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.removeItem(PENDING_DATA_WIPE_KEY)
}
