import type { InstitutionStackItem } from "./institution-stack.ts";
import { parseFinanceMoney } from "./money.ts";

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export type DonutStackSlice = {
  key: string
  kind: InstitutionStackItem["kind"]
  id: string
  name: string
  /** Absolute magnitude used for slice size (pie needs non-negative values). */
  value: number
  signedValue: number
  percent: number
  fill: string
}

function stackItemSignedValue(item: InstitutionStackItem): number | null {
  if (item.kind === "cash") {
    return parseFinanceMoney(item.balance)
  }
  if (item.status !== "COMPLETE" || item.netWorth === null) {
    return null
  }
  return parseFinanceMoney(item.netWorth)
}

function stackItemName(item: InstitutionStackItem): string {
  return item.kind === "institution" ? item.institution.name : item.account.name
}

function stackItemColor(item: InstitutionStackItem, index: number): string {
  const color =
    item.kind === "institution"
      ? item.institution.color
      : item.account.color
  return color?.trim() || FALLBACK_COLORS[index % FALLBACK_COLORS.length]!
}

/**
 * Maps wallet stack items into donut slices:
 * one slice per institution, plus orphan cash accounts (no institution).
 * Slice size uses |balance|; percent is share of the sum of absolutes.
 */
export function mapStackItemsToDonutSlices(
  items: readonly InstitutionStackItem[],
): DonutStackSlice[] {
  const parsed = items.flatMap((item, index) => {
    const signedValue = stackItemSignedValue(item)
    if (signedValue === null || signedValue === 0) {
      return []
    }
    return [
      {
        item,
        index,
        signedValue,
        value: Math.abs(signedValue),
      },
    ]
  })

  const totalAbs = parsed.reduce((sum, row) => sum + row.value, 0)
  if (totalAbs <= 0) {
    return []
  }

  return parsed.map(({ item, index, signedValue, value }) => ({
    key: `${item.kind}-${item.id}`,
    kind: item.kind,
    id: item.id,
    name: stackItemName(item),
    value,
    signedValue,
    percent: (value / totalAbs) * 100,
    fill: stackItemColor(item, index),
  }))
}
