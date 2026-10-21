"use client"

import {
  applyCalculatorKey,
  calculatorCommitValue,
  calculatorHeadline,
  createCalculatorState,
  isCalculatorOp,
  type CalculatorKey,
  type CalculatorState,
} from "@/src/modules/finance/shared/lib/amount-calculator"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { CheckIcon, DeleteIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type AmountCalculatorSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: string
  currency: string
  onCommit: (amount: string) => void
}

const KEY_ROWS: CalculatorKey[][] = [
  ["C", "%", "÷", "×"],
  ["7", "8", "9", "-"],
  ["4", "5", "6", "+"],
  ["1", "2", "3"],
  [".", "0", "backspace"],
]

export function AmountCalculatorSheet({
  open,
  onOpenChange,
  amount,
  currency,
  onCommit,
}: AmountCalculatorSheetProps) {
  const locale = useFormatLocale()
  const [state, setState] = useState<CalculatorState>(() =>
    createCalculatorState(amount)
  )
  const stateRef = useRef(state)
  const onCommitRef = useRef(onCommit)
  const amountRef = useRef(amount)
  const wasOpen = useRef(false)

  useEffect(() => {
    stateRef.current = state
    onCommitRef.current = onCommit
    amountRef.current = amount
  }, [amount, onCommit, state])

  useEffect(() => {
    if (wasOpen.current && !open) {
      onCommitRef.current(calculatorCommitValue(stateRef.current))
    }
    if (!wasOpen.current && open) {
      setState(createCalculatorState(amountRef.current))
    }
    wasOpen.current = open
  }, [open])

  function commitAndClose() {
    onCommit(calculatorCommitValue(stateRef.current))
    onOpenChange(false)
  }

  function press(key: CalculatorKey) {
    if (key === "=" && stateRef.current.justEvaluated) {
      commitAndClose()
      return
    }
    setState((current) => applyCalculatorKey(current, key))
  }

  const preview = formatFinanceMoney(calculatorCommitValue(state), {
    currency: currency || "USD",
    showCents: true,
    compactNumbers: false,
    locale,
  })
  const confirmed = state.justEvaluated

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onCommit(calculatorCommitValue(stateRef.current))
        }
        onOpenChange(next)
      }}
      title="Cantidad"
    >
      <div className="flex flex-col items-end gap-1 px-1">
        <p className="max-w-full text-right text-3xl leading-tight font-semibold wrap-break-word tabular-nums">
          {calculatorHeadline(state)}
        </p>
        <p className="text-sm text-muted-foreground tabular-nums">{preview}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEY_ROWS.slice(0, 3).map((row) =>
          row.map((key) => (
            <CalcKey key={key} calculatorKey={key} onPress={press} />
          ))
        )}
        {KEY_ROWS[3]?.map((key) => (
          <CalcKey key={key} calculatorKey={key} onPress={press} />
        ))}
        <Button
          type="button"
          aria-label={confirmed ? "Usar resultado" : "="}
          className="row-span-2 h-auto rounded-2xl bg-blue-500 text-2xl text-white hover:bg-blue-500/90"
          onClick={() => press("=")}
        >
          {confirmed ? <CheckIcon className="size-7" /> : "="}
        </Button>
        {KEY_ROWS[4]?.map((key) => (
          <CalcKey key={key} calculatorKey={key} onPress={press} />
        ))}
      </div>
    </BottomSheet>
  )
}

function CalcKey({
  calculatorKey,
  onPress,
}: {
  calculatorKey: CalculatorKey
  onPress: (key: CalculatorKey) => void
}) {
  const label =
    calculatorKey === "backspace" ? (
      <DeleteIcon className="size-5" />
    ) : (
      calculatorKey
    )
  const ariaLabel =
    calculatorKey === "backspace"
      ? "Borrar"
      : calculatorKey === "C"
        ? "Limpiar"
        : calculatorKey === "%"
          ? "Porcentaje"
          : calculatorKey
  const isCommand =
    isCalculatorOp(calculatorKey) ||
    calculatorKey === "C" ||
    calculatorKey === "%" ||
    calculatorKey === "backspace"
  return (
    <Button
      type="button"
      variant={isCommand ? "secondary" : "outline"}
      aria-label={ariaLabel}
      className={cn(
        "h-14 rounded-2xl text-lg",
        isCommand && "bg-muted text-foreground hover:bg-muted/80"
      )}
      onClick={() => onPress(calculatorKey)}
    >
      {label}
    </Button>
  )
}
