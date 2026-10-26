"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceMoneyFieldHandle } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceAmountEntryMode } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import type { TransactionFormValues } from "@/src/modules/finance/transactions/lib/transaction-form"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransactionAmountFieldProps = {
  control: Control<TransactionFormValues>
  errors: FieldErrors<TransactionFormValues>
  currency: string
  defaultCurrency: string
  locked: boolean
  entryMode: FinanceAmountEntryMode
  onEntryModeChange: (mode: FinanceAmountEntryMode) => void
  amountRef: React.RefObject<FinanceMoneyFieldHandle | null>
  onCommit: (amount: string) => void
  onBlur: () => void
  onCurrencyPress: () => void
}

export function TransactionAmountField({
  control,
  errors,
  currency,
  defaultCurrency,
  locked,
  entryMode,
  onEntryModeChange,
  amountRef,
  onCommit,
  onBlur,
  onCurrencyPress,
}: TransactionAmountFieldProps) {
  return (
    <Controller
      control={control}
      name="amount"
      render={({ field }) => (
        <FinanceMoneyField
          calculatorKey="transaction-amount"
          amount={field.value}
          onAmountChange={field.onChange}
          onAmountCommit={(next) => {
            field.onChange(next)
            onCommit(next)
          }}
          onAmountBlur={() => {
            field.onBlur()
            onBlur()
          }}
          amountError={errors.amount?.message}
          currency={currency || defaultCurrency}
          currencyError={errors.currency?.message}
          onCurrencyPress={onCurrencyPress}
          disabled={locked}
          entryMode={entryMode}
          onEntryModeChange={onEntryModeChange}
          fieldRef={amountRef}
        />
      )}
    />
  )
}
