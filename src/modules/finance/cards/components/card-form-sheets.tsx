"use client"

import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import { InstitutionPickerSheet } from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { splitLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

export type CardFormPicker = "none" | "institution" | "account" | "currency"

type CardFormSheetsProps = {
  picker: CardFormPicker
  closeHandlerFor: (picker: CardFormPicker) => (isOpen: boolean) => void
  institutions: FinanceInstitution[]
  institutionAccounts: FinanceAccount[]
  display: FinanceMoneyDisplay
  selectedInstitutionId: string
  defaultCurrency: string
  currencyRowValue: string
  onSelectInstitution: (institutionId: string) => void
  onSelectAccount: (target: string) => void
  onSelectCurrency: (currency: string) => void
}

export function CardFormSheets({
  picker,
  closeHandlerFor,
  institutions,
  institutionAccounts,
  display,
  selectedInstitutionId,
  defaultCurrency,
  currencyRowValue,
  onSelectInstitution,
  onSelectAccount,
  onSelectCurrency,
}: CardFormSheetsProps) {
  return (
    <>
      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={institutions}
        value={selectedInstitutionId}
        onSelect={onSelectInstitution}
      />

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
        accounts={institutionAccounts}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(next) =>
          onSelectAccount(splitLedgerTarget(next).accountId ?? "")
        }
      />

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currencyRowValue || defaultCurrency}
        onSelect={onSelectCurrency}
      />
    </>
  )
}
