"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field";
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog";
import { useCategories } from "@/src/modules/finance/hooks/use-categories";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/src/modules/finance/hooks/use-transactions";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import {
  buildCreateTransactionBody,
  buildLedgerTargetOptions,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads";
import type {
  FinanceAccount,
  FinanceCard,
  FinanceTransaction,
} from "@/src/modules/finance/types/entities";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRightIcon, DollarSign, StickyNoteIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z.string().trim().min(1, "Monto obligatorio"),
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  transactionDate: z.string().trim().min(1, "Fecha obligatoria"),
  destination: z.string().min(1, "Elige una cuenta o una tarjeta"),
  categoryId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED"]),
  merchant: z.string().max(200),
  description: z.string(),
  notes: z.string(),
})

type FormValues = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: "DEBIT", label: "Gasto" },
  { value: "CREDIT", label: "Ingreso" },
]
const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Completado" },
  { value: "PENDING", label: "Pendiente" },
]

function todayDateInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function dateInputValue(value: string | undefined): string {
  if (!value) return todayDateInput()
  return value.slice(0, 10)
}

function destinationFromTransaction(tx: FinanceTransaction | null): string {
  if (tx?.cardId) return encodeLedgerTarget("card", tx.cardId)
  if (tx?.accountId) return encodeLedgerTarget("account", tx.accountId)
  return CATALOG_NONE
}

function toFormValues(
  tx: FinanceTransaction | null,
  defaultCurrency: string,
  defaultDestination: string,
): FormValues {
  return {
    type: tx?.type === "CREDIT" ? "CREDIT" : "DEBIT",
    amount: tx?.amount ?? "",
    currency: tx?.currency ?? defaultCurrency,
    transactionDate: dateInputValue(tx?.transactionDate),
    destination: tx ? destinationFromTransaction(tx) : defaultDestination,
    categoryId: tx?.categoryId ?? CATALOG_NONE,
    status: tx?.status === "PENDING" ? "PENDING" : "CONFIRMED",
    merchant: tx?.merchant ?? "",
    description: tx?.description ?? "",
    notes: tx?.notes ?? "",
  }
}

function currencyForTarget(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[],
  fallback: string,
): string {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  if (account?.currency) return account.currency
  const card = cards.find((item) => item.id === target.cardId)
  const cardCurrency = card?.balances[0]?.currency
  if (cardCurrency) return cardCurrency
  return fallback
}

type TransactionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: FinanceTransaction | null
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  defaultCurrency: string
  enabled: boolean
}

export function TransactionSheet({
  open,
  onOpenChange,
  transaction,
  accounts,
  cards,
  defaultCurrency,
  enabled,
}: TransactionSheetProps) {
  const isEdit = Boolean(transaction)
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const categoriesQuery = useCategories(enabled && open)
  const isPending = createMutation.isPending || updateMutation.isPending
  const hasTargets = accounts.length > 0 || cards.length > 0

  const destinationOptions = useMemo(
    () => buildLedgerTargetOptions(accounts, cards),
    [accounts, cards],
  )
  const defaultDestination = destinationOptions[1]?.value ?? CATALOG_NONE
  const categoryOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Sin categoría" },
      ...(categoriesQuery.data ?? []).map((category) => ({
        value: category.id,
        label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
      })),
    ],
    [categoriesQuery.data],
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(transaction, defaultCurrency, defaultDestination),
  })

  const destination = useWatch({ control, name: "destination" })

  useEffect(() => {
    if (open) {
      reset(toFormValues(transaction, defaultCurrency, defaultDestination))
    }
  }, [open, transaction, defaultCurrency, defaultDestination, reset])

  useEffect(() => {
    if (!open || transaction) return
    setValue(
      "currency",
      currencyForTarget(destination, accounts, cards, defaultCurrency),
    )
  }, [open, transaction, destination, accounts, cards, defaultCurrency, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const target = splitLedgerTarget(values.destination)
    const payload = buildCreateTransactionBody({
      ...values,
      accountId: target.accountId,
      cardId: target.cardId,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          body: payload.body,
        })
        appToast.success({ text1: "Movimiento actualizado" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Movimiento creado" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar movimiento" : "Nuevo movimiento"}
      description={
        hasTargets
          ? "Registra un gasto o un ingreso. Las transferencias van en Transferir."
          : "Crea una cuenta o una tarjeta antes de registrar un movimiento."
      }
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            type="button"
            disabled={isPending || (!isEdit && !hasTargets)}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Movimiento" icon={ArrowLeftRightIcon}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SelectField
              label="Tipo"
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
            />
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FormTextField
              label="Monto"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.amount?.message}
              placeholder="1.50"
            />
          )}
        />
        <Controller
          control={control}
          name="transactionDate"
          render={({ field }) => (
            <FormTextField
              label="Fecha"
              type="date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.transactionDate?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="destination"
          render={({ field }) => (
            <SelectField
              label="Cuenta o tarjeta"
              value={field.value}
              onChange={field.onChange}
              options={destinationOptions}
              disabled={!hasTargets}
            />
          )}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <SelectField
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              options={STATUS_OPTIONS}
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <SelectField
              label="Categoría"
              value={field.value}
              onChange={field.onChange}
              options={categoryOptions}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Moneda" icon={DollarSign}>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <CurrencySelectField
              value={field.value}
              onChange={field.onChange}
              enabled={open}
              extraCodes={[defaultCurrency]}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Detalle" icon={StickyNoteIcon}>
        <Controller
          control={control}
          name="merchant"
          render={({ field }) => (
            <FormTextField
              label="Comercio"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.merchant?.message}
              placeholder="Supermercado"
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormTextField
              label="Descripción"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextField
              label="Notas"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
