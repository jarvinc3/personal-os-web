export type CategoryLike = {
  id: string
  parentId: string | null
}

export function isFinanceCategoryEditable(category: { isSystem: boolean }): boolean {
  return !category.isSystem
}

export type CategoryGroup<T extends CategoryLike> = {
  category: T
  children: T[]
}

/**
 * Groups a flat GET /finance/categories array by parentId on the client.
 * Does not assume a nested payload. Unknown parentId → treated as a root.
 */
export function groupCategoriesByParent<T extends CategoryLike>(
  items: T[],
): CategoryGroup<T>[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  const children = new Map<string, T[]>()
  const roots: T[] = []

  for (const item of items) {
    const parent = item.parentId ? byId.get(item.parentId) : undefined
    if (parent) {
      const list = children.get(parent.id) ?? []
      list.push(item)
      children.set(parent.id, list)
    } else {
      roots.push(item)
    }
  }

  return roots.map((category) => ({
    category,
    children: children.get(category.id) ?? [],
  }))
}

export function categoryTypeForTransaction(
  type: "DEBIT" | "CREDIT" | "TRANSFER",
): "EXPENSE" | "INCOME" | null {
  if (type === "DEBIT") return "EXPENSE"
  if (type === "CREDIT") return "INCOME"
  return null
}

export function filterCategoriesByType<T extends { type: string }>(
  items: T[],
  type: string,
): T[] {
  return items.filter((item) => item.type === type)
}

export function sortCategoriesNewestFirst<T extends { createdAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((left, right) => {
    if (left.createdAt === right.createdAt) return 0
    return left.createdAt < right.createdAt ? 1 : -1
  })
}

/**
 * Applies a session-only id order. Ids missing from `orderIds` stay in front,
 * in their incoming order, so newly created categories appear first.
 */
export function foldCategorySearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

export type CategorySearchHit<T extends CategoryLike & { name: string }> = {
  category: T
  children: T[]
  parentMatches: boolean
  matchingChildren: T[]
  /** A child hit opens the group. A parent-only hit stays collapsed. */
  open: boolean
}

/**
 * Empty query keeps every group collapsed.
 * A parent-only hit stays collapsed so its children do not bury the match.
 * A child hit opens that parent and keeps only the matching children.
 */
export function searchCategoryGroups<T extends CategoryLike & { name: string }>(
  groups: CategoryGroup<T>[],
  query: string,
): CategorySearchHit<T>[] {
  const needle = foldCategorySearch(query)
  if (!needle) {
    return groups.map((group) => ({
      category: group.category,
      children: group.children,
      parentMatches: false,
      matchingChildren: [],
      open: false,
    }))
  }

  const hits: CategorySearchHit<T>[] = []
  for (const group of groups) {
    const parentMatches = foldCategorySearch(group.category.name).includes(needle)
    const matchingChildren = group.children.filter((child) =>
      foldCategorySearch(child.name).includes(needle),
    )
    if (!parentMatches && matchingChildren.length === 0) continue
    const childHit = matchingChildren.length > 0
    hits.push({
      category: group.category,
      children: childHit ? matchingChildren : group.children,
      parentMatches,
      matchingChildren,
      open: childHit,
    })
  }
  return hits
}

export function applyLocalCategoryOrder<T extends { id: string }>(
  items: T[],
  orderIds: string[],
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  const known = new Set(orderIds)
  const fresh = items.filter((item) => !known.has(item.id))
  const ordered = orderIds.flatMap((id) => {
    const item = byId.get(id)
    return item ? [item] : []
  })
  return [...fresh, ...ordered]
}
