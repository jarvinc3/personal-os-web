"use client"

import { CurrencyTriggerLabel } from "@/src/modules/finance/components/currency-flag"
import { FinanceAmountInput } from "@/src/modules/finance/components/forms/finance-form-blocks"
import { AmountCalculatorSheet } from "@/src/modules/finance/components/transactions/amount-calculator-sheet"
import { narrowCurrencySymbol } from "@/src/modules/finance/lib/money"
import { Button } from "@/src/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import { InputGroupButton } from "@/src/shared/components/ui/input-group"
import { CalculatorIcon, KeyboardIcon } from "lucide-react"
import { useState } from "react"

type AmountEntryMode = "keyboard" | "calculator"

type FinanceMoneyFieldProps = {
  amount: string
  onAmountChange: (value: string) => void
  /** El commit de la calculadora sí valida de inmediato. */
  onAmountCommit: (value: string) => void
  onAmountBlur?: () => void
  amountError?: string
  currency: string
  currencyError?: string
  onCurrencyPress: () => void
}

export function FinanceMoneyField({
  amount,
  onAmountChange,
  onAmountCommit,
  onAmountBlur,
  amountError,
  currency,
  currencyError,
  onCurrencyPress,
}: FinanceMoneyFieldProps) {
  const [entryMode, setEntryMode] = useState<AmountEntryMode>("keyboard")
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const usingCalculator = entryMode === "calculator"

  function openCalculator() {
    setEntryMode("calculator")
    setCalculatorOpen(true)
  }

  function toggleEntryMode() {
    if (usingCalculator) {
      setEntryMode("keyboard")
      setCalculatorOpen(false)
      return
    }
    openCalculator()
  }

  return (
    <>
      <FieldGroup className="flex-row gap-2">
        <Field
          data-invalid={amountError ? true : undefined}
          className="w-auto min-w-0 flex-1 gap-1"
        >
          <FieldLabel className="text-sm text-muted-foreground">
            Cantidad
          </FieldLabel>
          <FinanceAmountInput
            prefix={narrowCurrencySymbol(currency)}
            value={amount}
            onChange={onAmountChange}
            onBlur={onAmountBlur}
            error={amountError}
            readOnly={usingCalculator}
            onReadOnlyActivate={openCalculator}
            trailing={
              <InputGroupButton
                size="icon-sm"
                aria-pressed={usingCalculator}
                aria-label={
                  usingCalculator ? "Usar teclado" : "Abrir calculadora"
                }
                onClick={toggleEntryMode}
              >
                {usingCalculator ? <CalculatorIcon /> : <KeyboardIcon />}
              </InputGroupButton>
            }
          />
          {amountError ? <FieldError>{amountError}</FieldError> : null}
        </Field>

        <Field
          data-invalid={currencyError ? true : undefined}
          className="w-auto shrink-0 gap-1 *:w-auto"
        >
          <FieldLabel className="text-sm text-muted-foreground">
            Moneda
          </FieldLabel>
          <Button
            type="button"
            variant="outline"
            className="h-14 rounded-2xl px-3 text-base"
            onClick={onCurrencyPress}
          >
            <CurrencyTriggerLabel code={currency} />
          </Button>
          {currencyError ? <FieldError>{currencyError}</FieldError> : null}
        </Field>
      </FieldGroup>

      <AmountCalculatorSheet
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        amount={amount}
        currency={currency}
        onCommit={onAmountCommit}
      />
    </>
  )
}
