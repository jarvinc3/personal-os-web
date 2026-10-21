import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceReconciliationStatusItem,
} from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

type StatusTarget = Pick<
  FinanceReconciliationStatusItem,
  "kind" | "accountId" | "cardId"
>

/**
 * Detail of the product with its reconciliation sheet already open, or null
 * when the product is no longer in the loaded lists.
 */
export function reconciliationProductHref({
  item,
  accounts,
  cards,
}: {
  item: StatusTarget
  accounts: readonly FinanceAccount[]
  cards: readonly FinanceCard[]
}): string | null {
  if (item.kind === "card") {
    const card = cards.find((candidate) => candidate.id === item.cardId)
    if (!card) {
      return null
    }
    return withReconciliationSheet(
      APP_ROUTES.app.financeInstitutionCard(card.institutionId, card.id),
      FINANCE_SHEET_KEYS.cardReconciliation
    )
  }
  const account = accounts.find((candidate) => candidate.id === item.accountId)
  if (!account) {
    return null
  }
  const path = account.institutionId
    ? APP_ROUTES.app.financeInstitutionAccount(
        account.institutionId,
        account.id
      )
    : APP_ROUTES.app.financeCashAccount(account.id)
  return withReconciliationSheet(path, FINANCE_SHEET_KEYS.accountReconciliation)
}

function withReconciliationSheet(path: string, sheetKey: string): string {
  return `${path}?sheet=${encodeURIComponent(sheetKey)}`
}
