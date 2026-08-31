export type CategoryLike = {
  id: string
  parentId: string | null
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
