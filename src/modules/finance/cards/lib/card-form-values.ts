import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceCard } from "@/src/modules/finance/shared/types/entities"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"

export function emptyBalanceRow(currency: string) {
  return { currency, balance: "", creditLimit: "" }
}

type ToCardFormValuesInput = {
  card: FinanceCard | null
  defaultCurrency: string
  defaultInstitutionId: string
}

export function toCardFormValues({
  card,
  defaultCurrency,
  defaultInstitutionId,
}: ToCardFormValuesInput): CardFormValues {
  return {
    name: card?.name ?? "",
    type: card?.type ?? "CREDIT",
    institutionId: card?.institutionId ?? defaultInstitutionId,
    accountId: card?.accountId ?? CATALOG_NONE,
    network: card?.network ?? "VISA",
    lastFour: card?.lastFour ?? "",
    statementClosingDay: card?.statementClosingDay
      ? String(card.statementClosingDay)
      : "",
    paymentDueDay: card?.paymentDueDay ? String(card.paymentDueDay) : "",
    color: card?.color ?? "",
    balances: [emptyBalanceRow(card?.balances[0]?.currency ?? defaultCurrency)],
  }
}
