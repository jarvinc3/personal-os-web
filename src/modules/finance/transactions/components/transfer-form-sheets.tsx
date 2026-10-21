"use client"

import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

export type TransferFormPicker = "none" | "from" | "to" | "currency"

type TransferFormSheetsProps = {
  picker: TransferFormPicker
  closeHandlerFor: (picker: TransferFormPicker) => (isOpen: boolean) => void
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  currency: string
  defaultCurrency: string
  excludeTarget: string | null
  onSelectTarget: (target: string) => void
  onSelectCurrency: (currency: string) => void
}

export function TransferFormSheets({
  picker,
  closeHandlerFor,
  institutions,
  accounts,
  cards,
  display,
  currency,
  defaultCurrency,
  excludeTarget,
  onSelectTarget,
  onSelectCurrency,
}: TransferFormSheetsProps) {
  return (
    <>
      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={onSelectCurrency}
      />

      <DestinationPickerSheet
        open={picker === "from" || picker === "to"}
        onOpenChange={closeHandlerFor(picker === "to" ? "to" : "from")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        accountsOnly={picker === "from" || picker === "to"}
        display={{ ...display, currency: currency || display.currency }}
        excludeTarget={excludeTarget}
        onSelect={onSelectTarget}
      />
    </>
  )
}
