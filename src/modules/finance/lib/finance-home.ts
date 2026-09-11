import type {
  FinanceCategory,
  FinanceTransaction,
} from "@/src/modules/finance/types/entities";

const DEFAULT_EXPENSE_COLOR = "#64748B"

export type FinanceFrequentExpense = {
  key: string
  label: string
  categoryName: string
  initials: string
  color: string
  icon?: string
  count: number
}

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
}

export function deriveFrequentExpenses(
  transactions: FinanceTransaction[],
  categories: FinanceCategory[],
  limit = 5,
): FinanceFrequentExpense[] {
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  )
  const grouped = new Map<
    string,
    { label: string; count: number; categoryId: string | null }
  >()

  for (const transaction of transactions) {
    if (transaction.transferGroupId || transaction.type === "TRANSFER") {
      continue
    }
    if (transaction.type !== "DEBIT" || transaction.status !== "CONFIRMED") {
      continue
    }
    const label = (transaction.merchant ?? transaction.description ?? "").trim()
    if (!label) continue

    const key = label.toLocaleLowerCase()
    const current = grouped.get(key)
    if (current) {
      current.count += 1
      current.categoryId ??= transaction.categoryId
    } else {
      grouped.set(key, {
        label,
        count: 1,
        categoryId: transaction.categoryId,
      })
    }
  }

  return [...grouped.entries()]
    .sort(
      ([keyA, valueA], [keyB, valueB]) =>
        valueB.count - valueA.count || keyA.localeCompare(keyB),
    )
    .slice(0, limit)
    .map(([key, value]) => {
      const category = value.categoryId
        ? categoryById.get(value.categoryId)
        : undefined
      const parent = category?.parentId
        ? categoryById.get(category.parentId)
        : undefined

      return {
        key,
        label: value.label,
        categoryName: category?.name ?? parent?.name ?? "Sin categoría",
        initials: initialsFromLabel(value.label),
        color:
          category?.color?.trim() ||
          parent?.color?.trim() ||
          DEFAULT_EXPENSE_COLOR,
        icon: category?.icon?.trim() || parent?.icon?.trim() || undefined,
        count: value.count,
      }
    })
}
