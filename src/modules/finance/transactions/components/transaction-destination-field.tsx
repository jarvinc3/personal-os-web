"use client"

import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"

type TransactionDestinationFieldProps = {
  destination: string
  label: string
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  disabled: boolean
  error?: string
  onOpen: () => void
}

export function TransactionDestinationField({
  destination,
  label,
  accounts,
  cards,
  display,
  disabled,
  error,
  onOpen,
}: TransactionDestinationFieldProps) {
  return (
    <Field className="gap-1">
      <FieldLabel className="text-sm text-muted-foreground">{label}</FieldLabel>
      <DestinationTrigger
        destination={destination}
        accounts={accounts}
        cards={cards}
        display={display}
        disabled={disabled}
        onClick={onOpen}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
