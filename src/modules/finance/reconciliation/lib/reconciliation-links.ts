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

export type FinanceProductTarget = {
  accountId?: string | null
  cardId?: string | null
}

/** Product detail, or null when the product is no longer in the loaded lists. */
export function productDetailHref({
  target,
  accounts,
  cards,
}: {
  target: FinanceProductTarget
  accounts: readonly FinanceAccount[]
  cards: readonly FinanceCard[]
}): string | null {
  if (target.cardId) {
    const card = cards.find((candidate) => candidate.id === target.cardId)
    if (!card) {
      return null
    }
    return APP_ROUTES.app.financeInstitutionCard(card.institutionId, card.id)
  }
  if (!target.accountId) {
    return null
  }
  const account = accounts.find(
    (candidate) => candidate.id === target.accountId
  )
  if (!account) {
    return null
  }
  return account.institutionId
    ? APP_ROUTES.app.financeInstitutionAccount(
        account.institutionId,
        account.id
      )
    : APP_ROUTES.app.financeCashAccount(account.id)
}

/**
 * Product detail with its reconciliation sheet already open, or null when the
 * product is no longer in the loaded lists.
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
  const path = productDetailHref({ target: item, accounts, cards })
  if (!path) {
    return null
  }
  return withReconciliationSheet(
    path,
    item.kind === "card"
      ? FINANCE_SHEET_KEYS.cardReconciliation
      : FINANCE_SHEET_KEYS.accountReconciliation
  )
}

function withReconciliationSheet(path: string, sheetKey: string): string {
  return `${path}?sheet=${encodeURIComponent(sheetKey)}`
}
