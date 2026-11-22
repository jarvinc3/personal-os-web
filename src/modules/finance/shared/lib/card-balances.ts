import { parseFinanceMoney } from "./money.ts"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceCardBalance,
} from "@/src/modules/finance/shared/types/entities"

export type FinanceCardDisplayBalance = Pick<
  FinanceCardBalance,
  "id" | "currency" | "balance"
> & {
  creditLimit?: string | null
  availableCredit?: string | null
}

export type CardUtilization = {
  /** What the card owes, including anything above the limit. */
  debt: number
  /** Debt over the limit; above 100% when the card is overspent. */
  utilizationPct: number
  /** How much the debt exceeds the limit, zero when it does not. */
  overdraft: number
}

export type CardCreditFacts = CardUtilization & {
  available: number
  creditLimit: number
}

/**
 * Amount a card shows for one currency: the available credit the API projects
 * for a credit card, or the balance for a debit card. The utilization bar and
 * the product rows read this value; the hero uses `cardHeroBalance` to show
 * the debt when a credit card is overspent.
 */
export function cardDisplayAmount(
  balance: FinanceCardDisplayBalance
): number | null {
  return parseFinanceMoney(balance.availableCredit ?? balance.balance)
}

/**
 * A negative available credit means the card owes more than its limit, so the
 * debt grows and the utilization goes past 100% instead of stopping there.
 */
export function cardUtilization(input: {
  available: number
  creditLimit: number
}): CardUtilization | null {
  const { available, creditLimit } = input
  if (creditLimit <= 0) {
    return null
  }
  const debt = Math.max(0, creditLimit - available)
  return {
    debt,
    utilizationPct: (debt / creditLimit) * 100,
    overdraft: Math.max(0, -available),
  }
}

/**
 * What a credit-card row shows beside the available credit: debt, limit and
 * utilization. Null without a usable limit, so the row never invents a debt
 * that equals the whole available credit.
 */
export function cardCreditFacts(
  balance: FinanceCardDisplayBalance
): CardCreditFacts | null {
  const available = cardDisplayAmount(balance)
  const creditLimit = parseFinanceMoney(balance.creditLimit ?? null)
  if (available === null || creditLimit === null) {
    return null
  }
  const utilization = cardUtilization({ available, creditLimit })
  if (utilization === null) {
    return null
  }
  return { available, creditLimit, ...utilization }
}

export type CardHeroBalance = {
  kind: "balance" | "available" | "debt"
  amount: number | null
}

/**
 * Amount the card face shows in its hero: the balance of a debit card, or the
 * available credit of a credit card. An overspent card shows its debt instead
 * of a negative available credit when its limit lets us compute it.
 */
export function cardHeroBalance(
  balance: FinanceCardDisplayBalance,
  cardType: FinanceCard["type"]
): CardHeroBalance {
  const available = cardDisplayAmount(balance)
  if (cardType !== "CREDIT") {
    return { kind: "balance", amount: available }
  }
  if (available !== null && available < 0) {
    const facts = cardCreditFacts(balance)
    if (facts) {
      return { kind: "debt", amount: facts.debt }
    }
  }
  return { kind: "available", amount: available }
}

export function resolveCardDisplayBalances(
  card: FinanceCard,
  accounts: readonly FinanceAccount[]
): FinanceCardDisplayBalance[] {
  if (card.type === "CREDIT") {
    return card.balances
  }

  const account = accounts.find((item) => item.id === card.accountId)
  return account
    ? [
        {
          id: account.id,
          currency: account.currency,
          balance: account.balance,
        },
      ]
    : []
}

export function canManageCardBalances(card: FinanceCard): boolean {
  return card.type === "CREDIT"
}
