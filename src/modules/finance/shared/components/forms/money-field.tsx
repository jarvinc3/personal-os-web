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
import { usePicker } from "@/src/shared/hooks/use-picker"
import { CalculatorIcon, KeyboardIcon } from "lucide-react"
import { useImperativeHandle, useRef, useState } from "react"
import type { RefObject } from "react"

type AmountEntryMode = "keyboard" | "calculator"

const CALCULATOR_PICKER = "calculator"
const NO_PICKER = "none"

export type FinanceMoneyFieldHandle = {
  focusAmount: () => void
}

type FinanceMoneyFieldProps = {
  amount: string
  onAmountChange: (value: string) => void
  /** El commit de la calculadora sí valida de inmediato. */
  onAmountCommit: (value: string) => void
  onAmountBlur?: () => void
  amountError?: string
  label?: string
  disabled?: boolean
  /** Clave del monto en la ruta de la calculadora; distinta por monto visible. */
  calculatorKey: string
  /** Moneda cuyo símbolo se dibuja antes del monto. */
  currency?: string
  /** Cuando existe, un botón al lado abre el selector de moneda. */
  onCurrencyPress?: () => void
  currencyError?: string
  /** Modo persistido del usuario; si falta, el campo lo maneja solo. */
  entryMode?: AmountEntryMode
  onEntryModeChange?: (mode: AmountEntryMode) => void
  /** Permite pedir el foco desde el flujo guiado. */
  fieldRef?: RefObject<FinanceMoneyFieldHandle | null>
}

export function FinanceMoneyField({
  amount,
  onAmountChange,
  onAmountCommit,
  onAmountBlur,
  amountError,
  label = "Cantidad",
  disabled,
  calculatorKey,
  currency,
  onCurrencyPress,
  currencyError,
  entryMode,
  onEntryModeChange,
  fieldRef,
}: FinanceMoneyFieldProps) {
  const [localEntryMode, setLocalEntryMode] =
    useState<AmountEntryMode>("keyboard")
  const { picker, openPicker, closeHandlerFor } = usePicker<string>(NO_PICKER)
  const calculatorPickerKey = `${CALCULATOR_PICKER}-${calculatorKey}`
  const activeEntryMode = entryMode ?? localEntryMode
  const usingCalculator = activeEntryMode === "calculator"
  const showsCurrencyButton = Boolean(onCurrencyPress)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(
    fieldRef,
    () => ({
      focusAmount() {
        if (usingCalculator) {
          openPicker(calculatorPickerKey)
          return
        }
        inputRef.current?.focus()
      },
    }),
    [usingCalculator, openPicker, calculatorPickerKey]
  )

  function changeEntryMode(next: AmountEntryMode) {
    setLocalEntryMode(next)
    onEntryModeChange?.(next)
  }

  function openCalculator() {
    changeEntryMode("calculator")
    openPicker(calculatorPickerKey)
  }

  function toggleEntryMode() {
    if (usingCalculator) {
      changeEntryMode("keyboard")
      closeHandlerFor(calculatorPickerKey)(false)
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
            inputRef={inputRef}
            trailing={
              <InputGroupButton
                size="icon-sm"
                disabled={disabled}
                aria-pressed={usingCalculator}
                aria-label={
                  usingCalculator ? "Usar teclado" : "Abrir calculadora"
                }
                onMouseDown={(event) => event.preventDefault()}
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
              onMouseDown={(event) => event.preventDefault()}
              onClick={onCurrencyPress}
            >
              <CurrencyTriggerLabel code={currency ?? ""} />
            </Button>
            {currencyError ? <FieldError>{currencyError}</FieldError> : null}
          </Field>
        ) : null}
      </FieldGroup>

      <AmountCalculatorSheet
        open={picker === calculatorPickerKey}
        onOpenChange={closeHandlerFor(calculatorPickerKey)}
        amount={amount}
        currency={currency ?? ""}
        onCommit={onAmountCommit}
      />
    </>
  )
}
