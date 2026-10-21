"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceMoneyFieldHandle } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceAmountEntryMode } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { TransferFxSection } from "@/src/modules/finance/transactions/components/transfer-fx-section"
import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import { ArrowUpDownIcon } from "lucide-react"
import type { RefObject } from "react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransferImportSectionProps = {
  control: Control<TransferFormValues>
  errors: FieldErrors<TransferFormValues>
  currency: string
  defaultCurrency: string
  destinationCurrency: string | null
  sourceCurrency: string
  marketRate: number | null
  receivedPreview: number | null
  display: FinanceMoneyDisplay
  statusSwitchId: string
  entryMode: FinanceAmountEntryMode
  onEntryModeChange: (mode: FinanceAmountEntryMode) => void
  amountRef: RefObject<FinanceMoneyFieldHandle | null>
  onAmountCommit: () => void
  onCurrencyPress: () => void
  onRateChange: () => void
  onReceivedCommit: () => void
}

export function TransferImportSection({
  control,
  errors,
  currency,
  defaultCurrency,
  destinationCurrency,
  sourceCurrency,
  marketRate,
  receivedPreview,
  display,
  statusSwitchId,
  entryMode,
  onEntryModeChange,
  amountRef,
  onAmountCommit,
  onCurrencyPress,
  onRateChange,
  onReceivedCommit,
}: TransferImportSectionProps) {
  return (
    <SummarySection title="Importe" icon={ArrowUpDownIcon}>
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <FinanceMoneyField
            amount={field.value}
            onAmountChange={field.onChange}
            onAmountCommit={(next) => {
              field.onChange(next)
              onAmountCommit()
            }}
            onAmountBlur={field.onBlur}
            amountError={errors.amount?.message}
            currency={currency || defaultCurrency}
            currencyError={errors.currency?.message}
            onCurrencyPress={onCurrencyPress}
            entryMode={entryMode}
            onEntryModeChange={onEntryModeChange}
            fieldRef={amountRef}
          />
        )}
      />

      <Controller
        control={control}
        name="transactionDate"
        render={({ field }) => (
          <FinanceDateField
            label="Fecha y hora"
            value={field.value}
            onChange={field.onChange}
            error={errors.transactionDate?.message}
            withTime
            aside={
              <Controller
                control={control}
                name="status"
                render={({ field: statusField }) => (
                  <Field
                    orientation="horizontal"
                    className="h-11 w-auto shrink-0 gap-2 rounded-xl border border-border bg-card px-3"
                  >
                    <FieldLabel
                      htmlFor={statusSwitchId}
                      className="text-sm font-medium"
                    >
                      Completado
                    </FieldLabel>
                    <Switch
                      id={statusSwitchId}
                      checked={statusField.value === "CONFIRMED"}
                      onCheckedChange={(checked) =>
                        statusField.onChange(checked ? "CONFIRMED" : "PENDING")
                      }
                    />
                  </Field>
                )}
              />
            }
          />
        )}
      />

      {destinationCurrency ? (
        <TransferFxSection
          control={control}
          errors={errors}
          destinationCurrency={destinationCurrency}
          sourceCurrency={sourceCurrency}
          marketRate={marketRate}
          receivedPreview={receivedPreview}
          display={display}
          onRateChange={onRateChange}
          onReceivedCommit={onReceivedCommit}
        />
      ) : null}
    </SummarySection>
  )
}
