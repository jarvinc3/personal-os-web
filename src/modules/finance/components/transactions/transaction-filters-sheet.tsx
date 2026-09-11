"use client"

import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field";
import { FINANCE_TX_FILTER_ALL } from "@/src/modules/finance/lib/transactions-query";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { SelectField } from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export type TransactionFilterState = {
  dateFrom: string
  dateTo: string
  accountId: string
  cardId: string
  type: string
  status: string
}

export const INITIAL_TRANSACTION_FILTERS: TransactionFilterState = {
  dateFrom: "",
  dateTo: "",
  accountId: FINANCE_TX_FILTER_ALL,
  cardId: FINANCE_TX_FILTER_ALL,
  type: FINANCE_TX_FILTER_ALL,
  status: FINANCE_TX_FILTER_ALL,
}

type SelectOption = { value: string; label: string }

type TransactionFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: TransactionFilterState
  onApply: (filters: TransactionFilterState) => void
  accountOptions: SelectOption[]
  cardOptions: SelectOption[]
  typeOptions: SelectOption[]
  statusOptions: SelectOption[]
}

export function countActiveTransactionFilters(
  filters: TransactionFilterState,
): number {
  return (
    Object.keys(INITIAL_TRANSACTION_FILTERS) as (keyof TransactionFilterState)[]
  ).filter((key) => filters[key] !== INITIAL_TRANSACTION_FILTERS[key]).length
}

export function TransactionFiltersSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  accountOptions,
  cardOptions,
  typeOptions,
  statusOptions,
}: TransactionFiltersSheetProps) {
  const [draft, setDraft] = useState<TransactionFilterState>(filters)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(filters)
  }
  const isDefault = countActiveTransactionFilters(draft) === 0

  function updateDraft<K extends keyof TransactionFilterState>(
    key: K,
    value: TransactionFilterState[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleClear() {
    onApply(INITIAL_TRANSACTION_FILTERS)
    onOpenChange(false)
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtros"
      description="Acota los movimientos por fecha, cuenta, tarjeta, tipo o estado."
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isDefault}
            onClick={handleClear}
          >
            Limpiar
          </Button>
        ),
        submit: (
          <Button
            type="submit"
            className="flex-1"
            onClick={handleApply}
          >
            Aplicar
          </Button>
        ),
      }}
    >
      <SummarySection title="Criterios" icon={SlidersHorizontal}>
        <FinanceDateField
          label="Desde"
          value={draft.dateFrom}
          onChange={(value) => updateDraft("dateFrom", value)}
          optional
        />
        <FinanceDateField
          label="Hasta"
          value={draft.dateTo}
          onChange={(value) => updateDraft("dateTo", value)}
          optional
        />
        <SelectField
          label="Cuenta"
          value={draft.accountId}
          onChange={(value) => updateDraft("accountId", value)}
          options={accountOptions}
        />
        <SelectField
          label="Tarjeta"
          value={draft.cardId}
          onChange={(value) => updateDraft("cardId", value)}
          options={cardOptions}
        />
        <SelectField
          label="Tipo"
          value={draft.type}
          onChange={(value) => updateDraft("type", value)}
          options={typeOptions}
        />
        <SelectField
          label="Estado"
          value={draft.status}
          onChange={(value) => updateDraft("status", value)}
          options={statusOptions}
        />
      </SummarySection>
    </BottomSheet>
  )
}
