import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceCard } from "@/src/modules/finance/shared/types/entities"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"

export function emptyBalanceRow(currency: string) {
  return { currency, balance: "", creditLimit: "" }
}

export type CardFormPrefill = {
  name?: string
  type?: CardFormValues["type"]
  lastFour?: string
  network?: string
  accountId?: string
}

type ToCardFormValuesInput = {
  card: FinanceCard | null
  defaultCurrency: string
  defaultInstitutionId: string
  prefill?: CardFormPrefill
}

type CardIdentity = Pick<
  CardFormValues,
  "name" | "type" | "institutionId" | "accountId" | "network" | "lastFour"
>

function identityFromCard(
  card: FinanceCard,
  defaultInstitutionId: string
): CardIdentity {
  return {
    name: card.name,
    type: card.type,
    institutionId: card.institutionId ?? defaultInstitutionId,
    accountId: card.accountId ?? CATALOG_NONE,
    network: card.network ?? "VISA",
    lastFour: card.lastFour ?? "",
  }
}

function identityFromPrefill(
  prefill: CardFormPrefill,
  defaultInstitutionId: string
): CardIdentity {
  return {
    name: prefill.name ?? "",
    type: prefill.type ?? "CREDIT",
    institutionId: defaultInstitutionId,
    accountId: prefill.accountId ?? CATALOG_NONE,
    network: prefill.network ?? "VISA",
    lastFour: prefill.lastFour ?? "",
  }
}

export function toCardFormValues({
  card,
  defaultCurrency,
  defaultInstitutionId,
  prefill = {},
}: ToCardFormValuesInput): CardFormValues {
  const identity = card
    ? identityFromCard(card, defaultInstitutionId)
    : identityFromPrefill(prefill, defaultInstitutionId)
  const currency = card?.balances[0]?.currency ?? defaultCurrency
  return {
    ...identity,
    statementClosingDay: card?.statementClosingDay
      ? String(card.statementClosingDay)
      : "",
    paymentDueDay: card?.paymentDueDay ? String(card.paymentDueDay) : "",
    color: card?.color ?? "",
    balances: [emptyBalanceRow(currency)],
  }
}
