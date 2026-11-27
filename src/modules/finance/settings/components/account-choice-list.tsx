"use client"

import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { usePicker } from "@/src/shared/hooks/use-picker"

type AccountChoiceListProps = {
  /** Clave del selector en la ruta; cada lista usa la suya. */
  pickerKey: string
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  display: FinanceMoneyDisplay
  selectedId: string
  onSelect: (accountId: string) => void
  noneLabel: string
}

export function AccountChoiceList({
  pickerKey,
  institutions,
  accounts,
  display,
  selectedId,
  onSelect,
  noneLabel,
}: AccountChoiceListProps) {
  const { picker, openPicker, closeHandlerFor } = usePicker<string>("none")

  return (
    <>
      <DestinationTrigger
        destination={
          selectedId ? encodeLedgerTarget("account", selectedId) : ""
        }
        accounts={accounts}
        cards={[]}
        display={display}
        placeholder={noneLabel}
        onClick={() => openPicker(pickerKey)}
      />
      <DestinationPickerSheet
        open={picker === pickerKey}
        onOpenChange={closeHandlerFor(pickerKey)}
        institutions={institutions}
        accounts={accounts}
        cards={[]}
        display={display}
        accountsOnly
        noneLabel={noneLabel}
        onSelect={(next) => onSelect(splitLedgerTarget(next).accountId ?? "")}
      />
    </>
  )
}
