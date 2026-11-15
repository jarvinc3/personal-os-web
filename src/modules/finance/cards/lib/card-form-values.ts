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

export function toCardFormValues({
  card,
  defaultCurrency,
  defaultInstitutionId,
  prefill = {},
}: ToCardFormValuesInput): CardFormValues {
  return {
    name: card?.name ?? prefill.name ?? "",
    type: card?.type ?? prefill.type ?? "CREDIT",
    institutionId: card?.institutionId ?? defaultInstitutionId,
    accountId: card?.accountId ?? prefill.accountId ?? CATALOG_NONE,
    network: card?.network ?? prefill.network ?? "VISA",
    lastFour: card?.lastFour ?? prefill.lastFour ?? "",
    statementClosingDay: card?.statementClosingDay
      ? String(card.statementClosingDay)
      : "",
    paymentDueDay: card?.paymentDueDay ? String(card.paymentDueDay) : "",
    color: card?.color ?? "",
    balances: [emptyBalanceRow(card?.balances[0]?.currency ?? defaultCurrency)],
  }
}
