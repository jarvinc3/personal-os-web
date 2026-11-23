import type {
  FinanceAccount,
  FinanceBalanceDrift,
  FinanceCard,
  FinanceReconciliationStatusItem,
} from "@/src/modules/finance/shared/types/entities"

type IrregularitySources = {
  drifts?: readonly FinanceBalanceDrift[]
  reconciliationItems?: readonly FinanceReconciliationStatusItem[]
}

type ProductRef = { accountId?: string | null; cardId?: string | null }

function hasDriftForProduct(
  drifts: readonly FinanceBalanceDrift[],
  target: ProductRef
): boolean {
  return drifts.some(
    (drift) =>
      (target.accountId !== undefined &&
        target.accountId !== null &&
        drift.accountId === target.accountId) ||
      (target.cardId !== undefined &&
        target.cardId !== null &&
        drift.cardId === target.cardId)
  )
}

function hasPendingReconciliationForProduct(
  reconciliationItems: readonly FinanceReconciliationStatusItem[],
  target: ProductRef
): boolean {
  return reconciliationItems.some(
    (item) =>
      !item.reconciled &&
      ((target.accountId !== undefined &&
        target.accountId !== null &&
        item.accountId === target.accountId) ||
        (target.cardId !== undefined &&
          target.cardId !== null &&
          item.cardId === target.cardId))
  )
}

function accountDrift(
  sources: IrregularitySources,
  account: FinanceAccount
): boolean {
  return hasDriftForProduct(sources.drifts ?? [], { accountId: account.id })
}

function accountReconciliation(
  sources: IrregularitySources,
  account: FinanceAccount
): boolean {
  return hasPendingReconciliationForProduct(sources.reconciliationItems ?? [], {
    accountId: account.id,
  })
}

export function productIrregularities(
  sources: IrregularitySources,
  products: {
    accounts: readonly FinanceAccount[]
    cards: readonly FinanceCard[]
  }
): { drift: boolean; reconciliation: boolean } {
  return {
    drift:
      products.accounts.some((account) => accountDrift(sources, account)) ||
      products.cards.some((card) =>
        hasDriftForProduct(sources.drifts ?? [], { cardId: card.id })
      ),
    reconciliation:
      products.accounts.some((account) =>
        accountReconciliation(sources, account)
      ) ||
      products.cards.some((card) =>
        hasPendingReconciliationForProduct(sources.reconciliationItems ?? [], {
          cardId: card.id,
        })
      ),
  }
}

export function accountIrregularities(
  sources: IrregularitySources,
  account: FinanceAccount
): { drift: boolean; reconciliation: boolean } {
  return {
    drift: accountDrift(sources, account),
    reconciliation: accountReconciliation(sources, account),
  }
}
