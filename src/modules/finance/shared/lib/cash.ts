import type {
  FinanceBalanceSheet,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

/** A cash institution: the system "Efectivo" or a legacy one of the same type. */
export function isCashInstitution(institution: FinanceInstitution): boolean {
  return institution.isSystem === true || institution.type === "cash"
}

/** Institutions offered for a card or a loan: cash is never one of them. */
export function selectableBankInstitutions(
  institutions: readonly FinanceInstitution[]
): FinanceInstitution[] {
  return institutions.filter((institution) => !isCashInstitution(institution))
}

/** Currencies that already have a cash account, upper-cased. */
export function cashCurrencies(
  sheet: FinanceBalanceSheet | undefined
): string[] {
  return (sheet?.cash.byCurrency ?? []).map((row) =>
    row.currency.trim().toUpperCase()
  )
}

/** True when the currency has no cash account yet. */
export function cashCurrencyMissing(
  sheet: FinanceBalanceSheet | undefined,
  currency: string
): boolean {
  const code = currency.trim().toUpperCase()
  return !cashCurrencies(sheet).includes(code)
}

/** Default cash account name for a currency: "Efectivo" or "Efectivo USD". */
export function cashAccountNameFor(
  currency: string,
  baseCurrency: string
): string {
  const code = currency.trim().toUpperCase()
  if (code === baseCurrency.trim().toUpperCase()) {
    return "Efectivo"
  }
  return `Efectivo ${code}`
}
