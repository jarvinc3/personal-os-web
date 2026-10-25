"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import {
  formatFinanceMoney,
  sanitizeAmountInput,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  formatTransferRateInput,
  transferRateLabel,
} from "@/src/modules/finance/transactions/lib/transfer-fx"
import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { ArrowUpDownIcon } from "lucide-react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type TransferFxSectionProps = {
  control: Control<TransferFormValues>
  errors: FieldErrors<TransferFormValues>
  destinationCurrency: string
  sourceCurrency: string
  marketRate: number | null
  receivedPreview: number | null
  display: FinanceMoneyDisplay
  onRateChange: () => void
  onReceivedCommit: () => void
}

export function TransferFxSection({
  control,
  errors,
  destinationCurrency,
  sourceCurrency,
  marketRate,
  receivedPreview,
  display,
  onRateChange,
  onReceivedCommit,
}: TransferFxSectionProps) {
  return (
    <>
      <Controller
        control={control}
        name="exchangeRate"
        render={({ field }) => (
          <FormTextField
            icon={ArrowUpDownIcon}
            label="Tasa aplicada"
            value={field.value}
            onChange={(next) => {
              onRateChange()
              field.onChange(sanitizeAmountInput(next))
            }}
            onBlur={field.onBlur}
            error={errors.exchangeRate?.message}
            placeholder={
              marketRate === null
                ? "Tasa del día"
                : formatTransferRateInput(marketRate)
            }
          />
        )}
      />
      <Controller
        control={control}
        name="receivedAmount"
        render={({ field }) => (
          <FinanceMoneyField
            label="Monto recibido"
            amount={field.value}
            onAmountChange={field.onChange}
            onAmountCommit={(next) => {
              field.onChange(next)
              onReceivedCommit()
            }}
            onAmountBlur={field.onBlur}
            amountError={errors.receivedAmount?.message}
            currency={destinationCurrency}
          />
        )}
      />
      <div className="flex flex-col gap-1 px-1 text-xs text-muted-foreground">
        <span>
          {marketRate === null
            ? "Tasa del día no disponible. Escribe la tasa o el monto recibido."
            : `Tasa del día: ${transferRateLabel({
                rate: marketRate,
                sourceCurrency,
                destinationCurrency,
                locale: display.locale,
              })}`}
        </span>
        {receivedPreview !== null ? (
          <span>
            Recibirás{" "}
            {formatFinanceMoney(String(receivedPreview), {
              ...display,
              currency: destinationCurrency,
            })}
            .
          </span>
        ) : null}
        <span>El monto recibido manda si escribes los dos.</span>
      </div>
    </>
  )
}
