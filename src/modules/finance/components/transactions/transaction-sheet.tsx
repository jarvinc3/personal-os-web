"use client"

import { ledgerTargetSelectOptions } from "@/src/modules/finance/components/ledger-target-select"
import { FinanceCurrencyPills } from "@/src/modules/finance/components/forms/finance-currency-pills"
import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field"
import {
  FinanceAmountField,
  FinanceDetailsDisclosure,
  FinanceSegmentedControl,
} from "@/src/modules/finance/components/forms/finance-form-blocks"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/src/modules/finance/hooks/use-transactions"
import {
  categoryTypeForTransaction,
  filterCategoriesByType,
} from "@/src/modules/finance/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  currencyForTarget,
  sliceDateInput,
  todayDateInput,
} from "@/src/modules/finance/lib/ledger-form"
import {
  buildCreateTransactionBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceTransaction,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftRightIcon, StickyNoteIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

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
  { value: "DEBIT" as const, label: "Gasto" },
  { value: "CREDIT" as const, label: "Ingreso" },
]
const STATUS_OPTIONS = [
  { value: "CONFIRMED" as const, label: "Completado" },
  { value: "PENDING" as const, label: "Pendiente" },
]

function destinationFromTransaction(tx: FinanceTransaction | null): string {
  if (tx?.cardId) return encodeLedgerTarget("card", tx.cardId)
  if (tx?.accountId) return encodeLedgerTarget("account", tx.accountId)
  return CATALOG_NONE
}

function toFormValues(
  tx: FinanceTransaction | null,
  defaultCurrency: string,
  defaultDestination: string
): FormValues {
  return {
    type: tx?.type === "CREDIT" ? "CREDIT" : "DEBIT",
    amount: tx?.amount ?? "",
    currency: tx?.currency ?? defaultCurrency,
    transactionDate: sliceDateInput(tx?.transactionDate, todayDateInput()),
    destination: tx ? destinationFromTransaction(tx) : defaultDestination,
    categoryId: tx?.categoryId ?? CATALOG_NONE,
    status: tx?.status === "PENDING" ? "PENDING" : "CONFIRMED",
    merchant: tx?.merchant ?? "",
    description: tx?.description ?? "",
    notes: tx?.notes ?? "",
  }
}

type TransactionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: FinanceTransaction | null
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  defaultCurrency: string
  enabled: boolean
  pending?: boolean
}

export function TransactionSheet({
  open,
  onOpenChange,
  transaction,
  accounts,
  cards,
  defaultCurrency,
  enabled,
  pending = false,
}: TransactionSheetProps) {
  const isEdit = Boolean(transaction)
  const isTransferLeg =
    Boolean(transaction?.transferGroupId) || transaction?.type === "TRANSFER"
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const categoriesQuery = useCategories(enabled && open)
  const isPending = createMutation.isPending || updateMutation.isPending
  const hasTargets = accounts.length > 0 || cards.length > 0

  const destinationOptions = useMemo(
    () => ledgerTargetSelectOptions(accounts, cards),
    [accounts, cards]
  )
  const defaultDestination = destinationOptions[1]?.value ?? CATALOG_NONE

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(
      transaction,
      defaultCurrency,
      defaultDestination
    ),
  })

  const destination = useWatch({ control, name: "destination" })
  const type = useWatch({ control, name: "type" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const categoryOptions = useMemo(() => {
    const expected = categoryTypeForTransaction(type) ?? "EXPENSE"
    const filtered = filterCategoriesByType(
      categoriesQuery.data ?? [],
      expected,
    )
    const options = [
      { value: CATALOG_NONE, label: "Sin categoría" },
      ...filtered.map((category) => ({
        value: category.id,
        label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
      })),
    ]
    const selected = (categoriesQuery.data ?? []).find(
      (category) => category.id === categoryId,
    )
    if (selected && !filtered.some((category) => category.id === selected.id)) {
      options.push({
        value: selected.id,
        label: `${selected.icon ? `${selected.icon} ` : ""}${selected.name}`,
      })
    }
    return options
  }, [categoriesQuery.data, type, categoryId])

  useEffect(() => {
    if (open) {
      reset(toFormValues(transaction, defaultCurrency, defaultDestination))
    }
  }, [open, transaction, defaultCurrency, defaultDestination, reset])

  useEffect(() => {
    if (!open || transaction) return
    setValue(
      "currency",
      currencyForTarget(destination, accounts, cards, defaultCurrency)
    )
  }, [
    open,
    transaction,
    destination,
    accounts,
    cards,
    defaultCurrency,
    setValue,
  ])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (isTransferLeg) return
    const target = splitLedgerTarget(values.destination)
    const payload = buildCreateTransactionBody(
      {
        ...values,
        accountId: target.accountId,
        cardId: target.cardId,
      },
      { isUpdate: isEdit },
    )
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

  const cta =
    isEdit
      ? "Guardar"
      : type === "CREDIT"
        ? "Registrar ingreso"
        : "Registrar gasto"

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={isEdit ? "Editar movimiento" : "Nuevo movimiento"}
      description={
        isTransferLeg
          ? "Las transferencias no se editan por pierna. Elimínalas o confírmalas desde el detalle."
          : hasTargets
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
        submit: isTransferLeg ? undefined : (
          <Button
            type="button"
            disabled={isPending || (!isEdit && !hasTargets)}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {cta}
          </Button>
        ),
      }}
    >
      <SummarySection title="Importe" icon={ArrowLeftRightIcon}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <FinanceSegmentedControl
              label="Tipo"
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                const expected = categoryTypeForTransaction(next)
                const current = (categoriesQuery.data ?? []).find(
                  (category) => category.id === categoryId,
                )
                if (current && current.type !== expected) {
                  setValue("categoryId", CATALOG_NONE)
                }
              }}
              options={TYPE_OPTIONS}
              disabled={isTransferLeg}
            />
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FinanceAmountField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <FinanceCurrencyPills
              value={field.value}
              onChange={field.onChange}
              baseCurrency={defaultCurrency}
              extraCodes={[defaultCurrency, transaction?.currency ?? ""]}
              disabled={isTransferLeg}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Movimiento" icon={StickyNoteIcon}>
        <Controller
          control={control}
          name="transactionDate"
          render={({ field }) => (
            <FinanceDateField
              label="Fecha"
              value={field.value}
              onChange={field.onChange}
              error={errors.transactionDate?.message}
              disabled={isTransferLeg}
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
              disabled={!hasTargets || isTransferLeg}
            />
          )}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <FinanceSegmentedControl
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              options={STATUS_OPTIONS}
              disabled={isTransferLeg}
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
              disabled={isTransferLeg}
            />
          )}
        />
      </SummarySection>

      <FinanceDetailsDisclosure defaultOpen={isEdit}>
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
              disabled={isTransferLeg}
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
              disabled={isTransferLeg}
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
              disabled={isTransferLeg}
            />
          )}
        />
      </FinanceDetailsDisclosure>
    </BottomSheet>
  )
}
