/** GET savings-goals / loans / receivables are arrays after unwrap. */

export function asFinanceArray<T>(payload: unknown): T[] {
  return Array.isArray(payload) ? (payload as T[]) : []
}

export function formatPlanningDate(value: string | null | undefined): string {
  if (!value) return ""
  return value.slice(0, 10)
}
