import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"

export function removeCategoryId(
  selectedIds: string[],
  categoryId: string
): string[] {
  return selectedIds.filter((id) => id !== categoryId)
}

/**
 * Multiple selection: picking CATALOG_NONE clears everything, any other id
 * toggles. Closing the sheet and single selection stay outside this helper.
 */
export function toggleCategorySelection(
  selectedIds: string[],
  categoryId: string
): string[] {
  if (categoryId === CATALOG_NONE) {
    return []
  }
  if (selectedIds.includes(categoryId)) {
    return removeCategoryId(selectedIds, categoryId)
  }
  return [...selectedIds, categoryId]
}
