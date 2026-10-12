"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import { useAdjustBalance } from "@/src/modules/finance/shared/hooks/use-balance-adjustment"
import {
  useDeleteCardBalance,
  useUpdateCardBalance,
  useUpdateCardCreditLimit,
} from "@/src/modules/finance/shared/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  buildCardBalanceBody,
  nextUnusedCurrency,
} from "@/src/modules/finance/shared/lib/catalog-payloads"
import { canManageCardBalances } from "@/src/modules/finance/shared/lib/card-balances"
import { buildFinanceCurrencyOptions } from "@/src/modules/finance/shared/lib/finance-currency"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceCard } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { cn } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, SaveIcon, TrashIcon, WalletIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import {
  cardBalanceSchemaWithLimit,
  type CardBalanceFormValues,
} from "@/src/modules/finance/catalog/lib/card-balance-form"

type BalanceMode =
  { kind: "edit"; currency: string } | { kind: "add"; currency: string }

function toFormValues(
  card: FinanceCard | null,
  mode: BalanceMode
): CardBalanceFormValues {
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
  if (card && !canManageCardBalances(card)) {
    return null
  }

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
  const mutation = useAdjustBalance()
  const openingBalanceMutation = useUpdateCardBalance()
  const creditLimitMutation = useUpdateCardCreditLimit()
  const deleteBalanceMutation = useDeleteCardBalance()
  const saving =
    mutation.isPending ||
    openingBalanceMutation.isPending ||
    creditLimitMutation.isPending ||
    deleteBalanceMutation.isPending
  const [mode, setMode] = useState<BalanceMode>(() =>
    initialMode(card, defaultCurrency)
  )
  const existingCurrencies = (card?.balances ?? []).map((item) => item.currency)
  const { config: financeConfig } = useFinanceEnabled()
  const allowedCurrencies = buildFinanceCurrencyOptions(
    defaultCurrency,
    financeConfig.trackedCurrencies
  )
  const canAddCurrency = allowedCurrencies.some(
    (code) => !existingCurrencies.some((used) => used.toUpperCase() === code)
  )
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CardBalanceFormValues>({
    resolver: zodResolver(cardBalanceSchemaWithLimit(card?.type === "CREDIT")),
    defaultValues: toFormValues(card, mode),
  })
  const selectedCurrency = useWatch({ control, name: "currency" })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "currency"
  >("none")

  function selectExisting(currency: string) {
    const nextMode: BalanceMode = { kind: "edit", currency }
    setMode(nextMode)
    reset(toFormValues(card, nextMode))
  }

  function startAdd() {
    const nextMode: BalanceMode = {
      kind: "add",
      currency: nextUnusedCurrency(
        existingCurrencies,
        defaultCurrency,
        financeConfig.trackedCurrencies
      ),
    }
    setMode(nextMode)
    reset(toFormValues(card, nextMode))
  }

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!card) {
      return
    }
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
      const result = await mutation.mutateAsync({
        cardId: card.id,
        currency: payload.body.currency,
        balance: payload.body.balance,
      })
      const openedAtZero = mode.kind === "add" && !result.adjusted
      if (openedAtZero) {
        await openingBalanceMutation.mutateAsync({
          id: card.id,
          body: payload.body,
        })
      } else if (
        card.type === "CREDIT" &&
        payload.body.creditLimit !== undefined
      ) {
        await creditLimitMutation.mutateAsync({
          id: card.id,
          body: {
            currency: payload.body.currency,
            creditLimit: payload.body.creditLimit,
          },
        })
      }
      appToast.success({
        text1:
          mode.kind === "add"
            ? "Moneda agregada"
            : result.adjusted
              ? "Saldo reajustado"
              : "Saldo actualizado",
      })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  const isAdding = mode.kind === "add"
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  async function deleteCurrency() {
    if (!card || mode.kind !== "edit") {
      return
    }
    try {
      await deleteBalanceMutation.mutateAsync({
        id: card.id,
        currency: mode.currency,
      })
      appToast.success({ text1: `${mode.currency} eliminada` })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        pending={pending || saving}
        title={card ? `Saldos · ${card.name}` : "Saldos de tarjeta"}
        description="El saldo nuevo queda como un reajuste. El límite de crédito se guarda aparte."
        actions={{
          close: (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              disabled={saving || !card}
              className="flex-1"
              onClick={onSubmit}
            >
              {saving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              {saving ? "Guardando..." : "Guardar"}
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
            name="balance"
            render={({ field }) => (
              <FinanceMoneyField
                label="Saldo"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("balance")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.balance?.message}
                currency={selectedCurrency || defaultCurrency}
                onCurrencyPress={
                  isAdding ? () => openPicker("currency") : undefined
                }
              />
            )}
          />
          {card?.type === "CREDIT" ? (
            <Controller
              control={control}
              name="creditLimit"
              render={({ field }) => (
                <FinanceMoneyField
                  label="Límite de crédito"
                  amount={field.value}
                  onAmountChange={field.onChange}
                  onAmountCommit={(next) => {
                    field.onChange(next)
                    void trigger("creditLimit")
                  }}
                  onAmountBlur={field.onBlur}
                  amountError={errors.creditLimit?.message}
                  currency={selectedCurrency || defaultCurrency}
                />
              )}
            />
          ) : null}
          {!isAdding ? (
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <TrashIcon className="size-4 shrink-0" />
              {`Eliminar ${mode.currency}`}
            </Button>
          ) : null}
        </SummarySection>
      </BottomSheet>

      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={(next) => {
          if (!deleteBalanceMutation.isPending) {
            setConfirmDeleteOpen(next)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {mode.currency}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quita ese saldo de la tarjeta. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBalanceMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteBalanceMutation.isPending}
              onClick={() => void deleteCurrency()}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={selectedCurrency || defaultCurrency}
        onSelect={(next) =>
          setValue("currency", next, { shouldValidate: true })
        }
      />
    </>
  )
}
