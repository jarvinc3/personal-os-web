/** GET savings-goals / loans / receivables are arrays after unwrap. */

import { parseFinanceMoney } from "./money.ts"

export function asFinanceArray<T>(payload: unknown): T[] {
  return Array.isArray(payload) ? (payload as T[]) : []
}

export function amountRatioPct(
  numerator: string | number | null | undefined,
  denominator: string | number | null | undefined,
): number | null {
  const amount = parseFinanceMoney(numerator)
  const total = parseFinanceMoney(denominator)
  if (amount === null || total === null || total === 0) return null
  return (amount / total) * 100
}

export function joinPlanningCaption(
  ...parts: Array<string | null | undefined>
): string | undefined {
  const listed = parts.map((part) => part?.trim()).filter(Boolean)
  return listed.length > 0 ? listed.join(" · ") : undefined
}

export function formatPlanningDate(value: string | null | undefined): string {
  if (!value) return ""
  return value.slice(0, 10)
}

export function visibleReceivables<T extends { status: string }>(items: T[]): T[] {
  return items.filter((item) => item.status !== "CANCELLED")
}
