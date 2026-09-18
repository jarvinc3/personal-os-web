"use client"

import { FinanceCurrencyPills } from "@/src/modules/finance/components/forms/finance-currency-pills"
import { useUpdateCardBalance } from "@/src/modules/finance/hooks/use-cards"
import {
  buildCardBalanceBody,
  nextUnusedCurrency,
} from "@/src/modules/finance/lib/catalog-payloads"
import { buildFinanceCurrencyOptions } from "@/src/modules/finance/lib/finance-currency"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import type { FinanceCard } from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { cn } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, WalletIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z.string().trim().min(1, "Saldo obligatorio"),
  creditLimit: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

type BalanceMode =
  { kind: "edit"; currency: string } | { kind: "add"; currency: string }

function toFormValues(card: FinanceCard | null, mode: BalanceMode): FormValues {
  const existing = card?.balances.find(
    (item) => item.currency === mode.currency
  )
  return {
    currency: existing?.currency ?? mode.currency,
    balance: existing?.balance ?? "",
    creditLimit: existing?.creditLimit ?? "",
  }
}

function initialMode(
  card: FinanceCard | null,
  defaultCurrency: string
): BalanceMode {
  const primary = card?.balances[0]
  if (primary) {
    return { kind: "edit", currency: primary.currency }
  }
  return { kind: "add", currency: defaultCurrency }
}

type CardBalanceSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: FinanceCard | null
  defaultCurrency: string
  display?: FinanceMoneyDisplay
  pending?: boolean
}

export function CardBalanceSheet({
  open,
  onOpenChange,
  card,
  defaultCurrency,
  display,
  pending = false,
}: CardBalanceSheetProps) {
  return (
    <CardBalanceSheetForm
      key={`${open ? "open" : "closed"}:${card?.id ?? "none"}`}
      open={open}
      onOpenChange={onOpenChange}
      card={card}
      defaultCurrency={defaultCurrency}
      display={display}
      pending={pending}
    />
  )
}

function CardBalanceSheetForm({
  open,
  onOpenChange,
  card,
  defaultCurrency,
  display,
  pending = false,
}: CardBalanceSheetProps) {
  const mutation = useUpdateCardBalance()
  const [mode, setMode] = useState<BalanceMode>(() =>
    initialMode(card, defaultCurrency)
  )
  const existingCurrencies = (card?.balances ?? []).map((item) => item.currency)
  const allowedCurrencies = buildFinanceCurrencyOptions(defaultCurrency)
  const canAddCurrency = allowedCurrencies.some(
    (code) =>
      !existingCurrencies.some((used) => used.toUpperCase() === code)
  )
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(card, mode),
  })

  function selectExisting(currency: string) {
    const nextMode: BalanceMode = { kind: "edit", currency }
    setMode(nextMode)
    reset(toFormValues(card, nextMode))
  }

  function startAdd() {
    const nextMode: BalanceMode = {
      kind: "add",
      currency: nextUnusedCurrency(existingCurrencies, defaultCurrency),
    }
    setMode(nextMode)
    reset(toFormValues(card, nextMode))
  }

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!card) return
    if (
      mode.kind === "add" &&
      existingCurrencies.some(
        (code) => code.toUpperCase() === values.currency.toUpperCase()
      )
    ) {
      appToast.error({ text1: "Cada moneda solo puede usarse una vez" })
      return
    }
    const payload = buildCardBalanceBody(values, {
      requireCreditLimit: card?.type === "CREDIT",
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await mutation.mutateAsync({ id: card.id, body: payload.body })
      appToast.success({
        text1: mode.kind === "add" ? "Moneda agregada" : "Saldo actualizado",
      })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  const isAdding = mode.kind === "add"

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={card ? `Saldos · ${card.name}` : "Saldos de tarjeta"}
      description="Puedes actualizar un saldo existente o agregar otra moneda. El API espera números en el body."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={mutation.isPending || !card}
            className="flex-1"
            onClick={onSubmit}
          >
            {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Monedas" icon={WalletIcon}>
        {(card?.balances ?? []).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectExisting(item.currency)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm",
              !isAdding && mode.currency === item.currency
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            )}
          >
            <span className="font-medium">{item.currency}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatFinanceMoney(item.balance, {
                currency: item.currency,
                showCents: display?.showCents ?? true,
                compactNumbers: display?.compactNumbers ?? false,
              })}
            </span>
          </button>
        ))}
        {canAddCurrency ? (
          <Button type="button" variant="outline" onClick={startAdd}>
            <PlusIcon />
            Agregar moneda
          </Button>
        ) : null}
      </SummarySection>

      <SummarySection
        title={isAdding ? "Nueva moneda" : `Editar ${mode.currency}`}
        icon={WalletIcon}
      >
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <FinanceCurrencyPills
              label="Moneda"
              value={field.value}
              onChange={field.onChange}
              baseCurrency={defaultCurrency}
              extraCodes={[defaultCurrency, field.value]}
              excludeCodes={isAdding ? existingCurrencies : []}
              disabled={!isAdding}
            />
          )}
        />
        <Controller
          control={control}
          name="balance"
          render={({ field }) => (
            <FormTextField
              label="Saldo"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.balance?.message}
              placeholder="0.00"
            />
          )}
        />
        {card?.type === "CREDIT" ? (
          <Controller
            control={control}
            name="creditLimit"
            render={({ field }) => (
              <FormTextField
                label="Límite de crédito"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.creditLimit?.message}
                placeholder="50000"
              />
            )}
          />
        ) : null}
      </SummarySection>
    </BottomSheet>
  )
}
