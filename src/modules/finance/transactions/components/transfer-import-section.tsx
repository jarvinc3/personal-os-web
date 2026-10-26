"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceMoneyFieldHandle } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceAmountEntryMode } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { LedgerDateStatusField } from "@/src/modules/finance/transactions/components/ledger-date-status-field"
import { TransferFxSection } from "@/src/modules/finance/transactions/components/transfer-fx-section"
import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ArrowUpDownIcon } from "lucide-react"
import type { RefObject } from "react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransferImportSectionProps = {
  form: {
    control: Control<TransferFormValues>
    errors: FieldErrors<TransferFormValues>
  }
  amount: {
    currency: string
    defaultCurrency: string
    entryMode: FinanceAmountEntryMode
    onEntryModeChange: (mode: FinanceAmountEntryMode) => void
    fieldRef: RefObject<FinanceMoneyFieldHandle | null>
    onCommit: () => void
    onCurrencyPress: () => void
  }
  statusSwitchId: string
  fx: {
    destinationCurrency: string | null
    sourceCurrency: string
    marketRate: number | null
    receivedPreview: number | null
    display: FinanceMoneyDisplay
    onRateChange: () => void
    onReceivedCommit: () => void
  }
}

export function TransferImportSection({
  form,
  amount,
  statusSwitchId,
  fx,
}: TransferImportSectionProps) {
  const { control, errors } = form
  return (
    <SummarySection title="Importe" icon={ArrowUpDownIcon}>
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <FinanceMoneyField
            calculatorKey="transfer-amount"
            amount={field.value}
            onAmountChange={field.onChange}
            onAmountCommit={(next) => {
              field.onChange(next)
              amount.onCommit()
            }}
            onAmountBlur={field.onBlur}
            amountError={errors.amount?.message}
            currency={amount.currency || amount.defaultCurrency}
            currencyError={errors.currency?.message}
            onCurrencyPress={amount.onCurrencyPress}
            entryMode={amount.entryMode}
            onEntryModeChange={amount.onEntryModeChange}
            fieldRef={amount.fieldRef}
          />
        )}
      />

      <Controller
        control={control}
        name="transactionDate"
        render={({ field }) => (
          <Controller
            control={control}
            name="status"
            render={({ field: statusField }) => (
              <LedgerDateStatusField
                date={{
                  value: field.value,
                  error: errors.transactionDate?.message,
                  onChange: field.onChange,
                }}
                status={{
                  value: statusField.value,
                  label: "Completado",
                  switchId: statusSwitchId,
                  onChange: statusField.onChange,
                }}
              />
            )}
          />
        )}
      />

      {fx.destinationCurrency ? (
        <TransferFxSection
          control={control}
          errors={errors}
          destinationCurrency={fx.destinationCurrency}
          sourceCurrency={fx.sourceCurrency}
          marketRate={fx.marketRate}
          receivedPreview={fx.receivedPreview}
          display={fx.display}
          onRateChange={fx.onRateChange}
          onReceivedCommit={fx.onReceivedCommit}
        />
      ) : null}
    </SummarySection>
  )
}
