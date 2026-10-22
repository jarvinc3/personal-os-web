"use client"

import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceCategory,
  FinanceCategoryType,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

export type TransactionFormPicker =
  "none" | "category" | "currency" | "destination"

type TransactionFormSheetsProps = {
  picker: TransactionFormPicker
  closeHandlerFor: (picker: TransactionFormPicker) => (isOpen: boolean) => void
  categories: FinanceCategory[]
  categoryType: FinanceCategoryType
  currency: string
  defaultCurrency: string
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  onSelectCategory: (categoryId: string) => void
  onSelectCurrency: (currency: string) => void
  onSelectDestination: (destination: string) => void
}

export function TransactionFormSheets({
  picker,
  closeHandlerFor,
  categories,
  categoryType,
  currency,
  defaultCurrency,
  institutions,
  accounts,
  cards,
  display,
  onSelectCategory,
  onSelectCurrency,
  onSelectDestination,
}: TransactionFormSheetsProps) {
  return (
    <>
      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType={categoryType}
        onSelect={onSelectCategory}
      />

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={onSelectCurrency}
      />

      <DestinationPickerSheet
        open={picker === "destination"}
        onOpenChange={closeHandlerFor("destination")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={{ ...display, currency: currency || display.currency }}
        onSelect={onSelectDestination}
      />
    </>
  )
}
