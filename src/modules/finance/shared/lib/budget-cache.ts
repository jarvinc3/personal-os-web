import type { FinancePaginated } from "@/src/modules/finance/shared/types/api"
import type { FinanceBudget } from "@/src/modules/finance/shared/types/entities"

/**
 * Budget already loaded by the list, so the detail can paint its header before
 * the detail request answers.
 */
export function budgetFromListPages(
  pages: ReadonlyArray<FinancePaginated<FinanceBudget>>,
  id: string
): FinanceBudget | undefined {
  for (const page of pages) {
    const found = page.items.find((budget) => budget.id === id)
    if (found) {
      return found
    }
  }
  return undefined
}
