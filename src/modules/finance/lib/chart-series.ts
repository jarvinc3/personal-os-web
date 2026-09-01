import { parseFinanceMoney } from "./money.ts"

export const UNCATEGORIZED_LABEL = "Sin categoría"

export type SpendingBucketLike = {
  categoryId: string | null
  name: string
  color: string | null
  icon: string | null
  total: string
}

export type SpendingPointLike = {
  date: string
  expenses: string
  income: string
}

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function mapSpendingBucketsToChart(buckets: SpendingBucketLike[]) {
  return buckets.flatMap((bucket, index) => {
    const total = parseFinanceMoney(bucket.total)
    if (total === null) {
      return []
    }
    const label =
      bucket.categoryId === null ? UNCATEGORIZED_LABEL : bucket.name
    return [
      {
        key: bucket.categoryId ?? "uncategorized",
        label: `${bucket.icon ? `${bucket.icon} ` : ""}${label}`,
        total,
        fill: bucket.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]!,
      },
    ]
  })
}

export function mapSpendingPointsToChart(
  payload: { points?: SpendingPointLike[] } | undefined,
) {
  const points = payload?.points
  if (!Array.isArray(points)) {
    return []
  }
  return points.flatMap((point) => {
    const expenses = parseFinanceMoney(point.expenses)
    const income = parseFinanceMoney(point.income)
    if (expenses === null || income === null) {
      return []
    }
    return [{ date: point.date, expenses, income }]
  })
}
