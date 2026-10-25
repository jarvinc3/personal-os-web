"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { PlusIcon, TrashIcon, WalletIcon } from "lucide-react"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormTrigger,
} from "react-hook-form"

type CardBalanceRow = { id: string }

type CardBalancesSectionProps = {
  form: {
    control: Control<CardFormValues>
    errors: FieldErrors<CardFormValues>
    onTrigger: UseFormTrigger<CardFormValues>
  }
  balances: {
    rows: CardBalanceRow[]
    values: NonNullable<CardFormValues["balances"]>
    defaultCurrency: string
  }
  canAddCurrency: boolean
  actions: {
    onRemoveRow: (index: number) => void
    onAddCurrency: () => void
    onOpenCurrency: (index: number) => void
  }
}

export function CardBalancesSection({
  form,
  balances,
  canAddCurrency,
  actions,
}: CardBalancesSectionProps) {
  const { control, errors, onTrigger } = form
  const { rows, values, defaultCurrency } = balances
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
                currency={values[index]?.currency ?? defaultCurrency}
                onCurrencyPress={() => actions.onOpenCurrency(index)}
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
                currency={values[index]?.currency ?? defaultCurrency}
              />
            )}
          />
          {rows.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => actions.onRemoveRow(index)}
            >
              <TrashIcon className="size-4 shrink-0" />
              Quitar moneda
            </Button>
          ) : null}
        </div>
      ))}
      {canAddCurrency ? (
        <Button type="button" variant="outline" onClick={actions.onAddCurrency}>
          <PlusIcon className="size-4 shrink-0" />
          Agregar moneda
        </Button>
      ) : null}
    </SummarySection>
  )
}
