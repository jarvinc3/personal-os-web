export const PENDING_ACCOUNT_DELETION_KEY = "pendingAccountDeletion"

export function setPendingAccountDeletion() {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.setItem(PENDING_ACCOUNT_DELETION_KEY, "1")
}

export function consumePendingAccountDeletion(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  const pending = sessionStorage.getItem(PENDING_ACCOUNT_DELETION_KEY) === "1"
  if (pending) {
    sessionStorage.removeItem(PENDING_ACCOUNT_DELETION_KEY)
  }
  return pending
}

export function clearPendingAccountDeletion() {
  if (typeof window === "undefined") {
    return
  }
  sessionStorage.removeItem(PENDING_ACCOUNT_DELETION_KEY)
}
