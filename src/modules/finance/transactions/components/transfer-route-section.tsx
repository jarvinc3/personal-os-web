"use client"

import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ArrowLeftRightIcon } from "lucide-react"

type TransferRouteSectionProps = {
  fromTarget: string
  toTarget: string
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  disabled: boolean
  destinationError?: string
  onOpenFrom: () => void
  onOpenTo: () => void
}

export function TransferRouteSection({
  fromTarget,
  toTarget,
  accounts,
  cards,
  display,
  disabled,
  destinationError,
  onOpenFrom,
  onOpenTo,
}: TransferRouteSectionProps) {
  return (
    <SummarySection title="Ruta" icon={ArrowLeftRightIcon}>
      <Field className="gap-1">
        <FieldLabel className="text-sm text-muted-foreground">
          Origen
        </FieldLabel>
        <DestinationTrigger
          destination={fromTarget}
          accounts={accounts}
          cards={cards}
          display={display}
          disabled={disabled}
          placeholder="Elige origen"
          onClick={onOpenFrom}
        />
      </Field>

      <Field className="gap-1">
        <FieldLabel className="text-sm text-muted-foreground">
          Destino
        </FieldLabel>
        <DestinationTrigger
          destination={toTarget}
          accounts={accounts}
          cards={cards}
          display={display}
          disabled={disabled}
          placeholder="Elige destino"
          onClick={onOpenTo}
        />
        {destinationError ? <FieldError>{destinationError}</FieldError> : null}
      </Field>
    </SummarySection>
  )
}
