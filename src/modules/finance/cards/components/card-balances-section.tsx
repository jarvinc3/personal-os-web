"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { PlusIcon, TrashIcon, WalletIcon } from "lucide-react"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormTrigger,
} from "react-hook-form"

type CardBalanceRow = { id: string }

type CardBalancesSectionProps = {
  control: Control<CardFormValues>
  errors: FieldErrors<CardFormValues>
  rows: CardBalanceRow[]
  balances: NonNullable<CardFormValues["balances"]>
  defaultCurrency: string
  canAddCurrency: boolean
  onRemoveRow: (index: number) => void
  onAddCurrency: () => void
  onOpenCurrency: (index: number) => void
  onTrigger: UseFormTrigger<CardFormValues>
}

export function CardBalancesSection({
  control,
  errors,
  rows,
  balances,
  defaultCurrency,
  canAddCurrency,
  onRemoveRow,
  onAddCurrency,
  onOpenCurrency,
  onTrigger,
}: CardBalancesSectionProps) {
  return (
    <SummarySection title="Importe" icon={WalletIcon}>
      {rows.map((row, index) => (
        <div key={row.id} className="flex flex-col gap-3">
          <Controller
            control={control}
            name={`balances.${index}.creditLimit`}
            render={({ field }) => (
              <FinanceMoneyField
                label="Límite"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void onTrigger(`balances.${index}.creditLimit`)
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.balances?.[index]?.creditLimit?.message}
                currency={balances[index]?.currency ?? defaultCurrency}
                onCurrencyPress={() => onOpenCurrency(index)}
              />
            )}
          />
          <Controller
            control={control}
            name={`balances.${index}.balance`}
            render={({ field }) => (
              <FinanceMoneyField
                label="Saldo al corte"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void onTrigger(`balances.${index}.balance`)
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.balances?.[index]?.balance?.message}
                currency={balances[index]?.currency ?? defaultCurrency}
              />
            )}
          />
          {rows.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRemoveRow(index)}
            >
              <TrashIcon className="size-4 shrink-0" />
              Quitar moneda
            </Button>
          ) : null}
        </div>
      ))}
      {canAddCurrency ? (
        <Button type="button" variant="outline" onClick={onAddCurrency}>
          <PlusIcon className="size-4 shrink-0" />
          Agregar moneda
        </Button>
      ) : null}
    </SummarySection>
  )
}
