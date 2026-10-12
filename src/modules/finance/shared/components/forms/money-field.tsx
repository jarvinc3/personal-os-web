"use client"

import { CurrencyTriggerLabel } from "@/src/modules/finance/shared/components/currency-flag"
import { AmountCalculatorSheet } from "@/src/modules/finance/shared/components/forms/amount-calculator-sheet"
import { FinanceAmountInput } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { narrowCurrencySymbol } from "@/src/modules/finance/shared/lib/money"
import { Button } from "@/src/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import { InputGroupButton } from "@/src/shared/components/ui/input-group"
import { cn } from "@/src/shared/lib/utils"
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
  label?: string
  disabled?: boolean
  /** Moneda cuyo símbolo se dibuja antes del monto. */
  currency?: string
  /** Cuando existe, un botón al lado abre el selector de moneda. */
  onCurrencyPress?: () => void
  currencyError?: string
}

export function FinanceMoneyField({
  amount,
  onAmountChange,
  onAmountCommit,
  onAmountBlur,
  amountError,
  label = "Cantidad",
  disabled,
  currency,
  onCurrencyPress,
  currencyError,
}: FinanceMoneyFieldProps) {
  const [entryMode, setEntryMode] = useState<AmountEntryMode>("keyboard")
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const usingCalculator = entryMode === "calculator"
  const showsCurrencyButton = Boolean(onCurrencyPress)

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
      <FieldGroup className={cn("gap-2", showsCurrencyButton && "flex-row")}>
        <Field
          data-invalid={amountError ? true : undefined}
          className="w-auto min-w-0 flex-1 gap-1"
        >
          <FieldLabel className="text-sm text-muted-foreground">
            {label}
          </FieldLabel>
          <FinanceAmountInput
            prefix={currency ? narrowCurrencySymbol(currency) : null}
            value={amount}
            onChange={onAmountChange}
            onBlur={onAmountBlur}
            error={amountError}
            disabled={disabled}
            readOnly={usingCalculator}
            onReadOnlyActivate={openCalculator}
            trailing={
              <InputGroupButton
                size="icon-sm"
                disabled={disabled}
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

        {showsCurrencyButton ? (
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
              disabled={disabled}
              onClick={onCurrencyPress}
            >
              <CurrencyTriggerLabel code={currency ?? ""} />
            </Button>
            {currencyError ? <FieldError>{currencyError}</FieldError> : null}
          </Field>
        ) : null}
      </FieldGroup>

      <AmountCalculatorSheet
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        amount={amount}
        currency={currency ?? ""}
        onCommit={onAmountCommit}
      />
    </>
  )
}
