"use client"

import { CurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/currency-picker-sheet"
import { useFinanceCurrencyChoices } from "@/src/modules/finance/shared/hooks/use-finance-currency-choices"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"

type FinanceCurrencyPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSelect: (code: string) => void
}

/** Selector de moneda con las monedas del usuario y su tasa frente a la principal. */
export function FinanceCurrencyPickerSheet({
  open,
  onOpenChange,
  value,
  onSelect,
}: FinanceCurrencyPickerSheetProps) {
  const { isEnabled } = useFinanceEnabled()
  const current = value.trim()
  const { baseCurrency, codes, quotes } = useFinanceCurrencyChoices(current)

  return (
    <CurrencyPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      value={current}
      enabled={isEnabled}
      codes={codes}
      quotes={quotes}
      quoteCurrency={baseCurrency}
      showNames
      onSelect={onSelect}
    />
  )
}
