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
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
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
          <Field
            data-invalid={errors.exchangeRate ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="transfer-rate"
              className="pl-2 text-sm text-muted-foreground"
            >
              Tasa aplicada
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <ArrowUpDownIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="transfer-rate"
                value={field.value}
                onChange={(event) => {
                  onRateChange()
                  field.onChange(sanitizeAmountInput(event.target.value))
                }}
                onBlur={field.onBlur}
                placeholder={
                  marketRate === null
                    ? "Tasa del día"
                    : formatTransferRateInput(marketRate)
                }
                aria-invalid={errors.exchangeRate ? true : undefined}
              />
            </InputGroup>
            {errors.exchangeRate?.message ? (
              <FieldError>{errors.exchangeRate.message}</FieldError>
            ) : null}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="receivedAmount"
        render={({ field }) => (
          <FinanceMoneyField
            calculatorKey="transfer-received-amount"
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
