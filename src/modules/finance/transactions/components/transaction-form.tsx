"use client"

import { CategoryCard } from "@/src/modules/finance/catalog"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CategoryPickerSheet } from "@/src/modules/finance/transactions/components/category-picker-sheet"
import { CurrencyPickerSheet } from "@/src/modules/finance/transactions/components/currency-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/transactions/components/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/transactions/components/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useCurrencyForTarget } from "@/src/modules/finance/shared/hooks/use-currency-for-target"
import { useFinanceCurrencyChoices } from "@/src/modules/finance/shared/hooks/use-finance-currency-choices"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/src/modules/finance/shared/hooks/use-transactions"
import { categoryTypeForTransaction } from "@/src/modules/finance/shared/lib/category-tree"
import {
  buildDestinationPickerGroups,
  firstLedgerTarget,
  isKnownLedgerTarget,
} from "@/src/modules/finance/shared/lib/destination-picker"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  sliceDateTimeInput,
  wallClockToIso,
} from "@/src/modules/finance/shared/lib/ledger-form"
import {
  buildCreateTransactionBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceCategory,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  FileTextIcon,
  HandCoinsIcon,
  InfoIcon,
  NotebookPenIcon,
  SaveIcon,
  StoreIcon,
} from "lucide-react"
import { useCallback, useEffect, useId, useMemo, useRef } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/src/modules/finance/transactions/lib/transaction-form"

type MovementType = TransactionFormValues["type"]
type Picker = "none" | "category" | "currency" | "destination"

const TYPE_OPTIONS = [
  { value: "DEBIT" as const, label: "Gasto", icon: ArrowDownCircleIcon },
  { value: "CREDIT" as const, label: "Ingreso", icon: ArrowUpCircleIcon },
]

function destinationFromTransaction(tx: FinanceTransaction | null): string {
  if (tx?.cardId) {
    return encodeLedgerTarget("card", tx.cardId)
  }
  if (tx?.accountId) {
    return encodeLedgerTarget("account", tx.accountId)
  }
  return CATALOG_NONE
}

function toFormValues(
  tx: FinanceTransaction | null,
  initialType: MovementType,
  defaultCurrency: string,
  defaultDestination: string
): TransactionFormValues {
  return {
    type: tx?.type === "CREDIT" ? "CREDIT" : tx ? "DEBIT" : initialType,
    amount: tx?.amount ?? "",
    currency: tx?.currency ?? defaultCurrency,
    transactionDate: sliceDateTimeInput(tx?.transactionDate),
    destination: tx ? destinationFromTransaction(tx) : defaultDestination,
    categoryId: tx?.categoryId ?? CATALOG_NONE,
    status: tx?.status === "PENDING" ? "PENDING" : "CONFIRMED",
    merchant: tx?.merchant ?? "",
    description: tx?.description ?? "",
    notes: tx?.notes ?? "",
  }
}

type TransactionFormProps = {
  mode: "create" | "edit"
  initialType: MovementType
  initialDestination?: string | null
  transaction: FinanceTransaction | null
  defaultCurrency: string
  enabled: boolean
  display: FinanceMoneyDisplay
  onTypeChange?: (type: MovementType) => void
  onDone: () => void
}

export function TransactionForm({
  mode,
  initialType,
  initialDestination = null,
  transaction,
  defaultCurrency,
  enabled,
  display,
  onTypeChange,
  onDone,
}: TransactionFormProps) {
  const isEdit = mode === "edit"
  const isTransferLeg =
    Boolean(transaction?.transferGroupId) || transaction?.type === "TRANSFER"
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const categoriesQuery = useCategories(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  )
  const institutions = useMemo(
    () => institutionsQuery.data ?? [],
    [institutionsQuery.data]
  )
  const isPending = createMutation.isPending || updateMutation.isPending
  const hasTargets = accounts.length > 0 || cards.length > 0
  const groups = useMemo(
    () => buildDestinationPickerGroups({ institutions, accounts, cards }),
    [institutions, accounts, cards]
  )
  const { picker, openPicker, closeHandlerFor } = usePicker<Picker>("none")
  const didAutoOpenCategory = useRef(false)
  const statusSwitchId = useId()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    mode: "onTouched",
    resolver: zodResolver(transactionSchema),
    defaultValues: toFormValues(
      transaction,
      initialType,
      defaultCurrency,
      CATALOG_NONE
    ),
  })

  const formValues = useWatch({ control })
  const formIsValid = transactionSchema.safeParse(formValues).success
  const destination = useWatch({ control, name: "destination" })
  const type = useWatch({ control, name: "type" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const currency = useWatch({ control, name: "currency" })
  const {
    baseCurrency,
    codes: currencyCodes,
    quotes: currencyQuotes,
  } = useFinanceCurrencyChoices(currency || defaultCurrency)
  const targetsReady = accountsQuery.isSuccess && cardsQuery.isSuccess
  const canSave =
    !isPending && formIsValid && (isEdit || (targetsReady && hasTargets))

  const selectedCategory =
    categories.find((item) => item.id === categoryId) ?? null

  const applyTargetCurrency = useCallback(
    (next: string) => {
      setValue("currency", next)
    },
    [setValue]
  )

  useCurrencyForTarget(
    destination,
    accounts,
    cards,
    defaultCurrency,
    applyTargetCurrency,
    !isEdit
  )

  useEffect(() => {
    if (isEdit && !transaction) {
      return
    }
    reset(
      toFormValues(
        isEdit ? transaction : null,
        initialType,
        defaultCurrency,
        getValues("destination") || CATALOG_NONE
      )
    )
  }, [isEdit, transaction, initialType, defaultCurrency, reset, getValues])

  useEffect(() => {
    if (isEdit) {
      return
    }
    if (
      !accountsQuery.isSuccess ||
      !cardsQuery.isSuccess ||
      !institutionsQuery.isSuccess
    ) {
      return
    }
    const preferred = initialDestination?.trim()
    if (preferred && isKnownLedgerTarget(preferred, accounts, cards)) {
      if (getValues("destination") !== preferred) {
        setValue("destination", preferred)
      }
      return
    }
    const current = getValues("destination")
    if (
      current &&
      current !== CATALOG_NONE &&
      isKnownLedgerTarget(current, accounts, cards)
    ) {
      return
    }
    const next = firstLedgerTarget(groups)
    if (next !== CATALOG_NONE) {
      setValue("destination", next)
    }
  }, [
    groups,
    accounts,
    cards,
    initialDestination,
    isEdit,
    getValues,
    setValue,
    accountsQuery.isSuccess,
    cardsQuery.isSuccess,
    institutionsQuery.isSuccess,
  ])

  useEffect(() => {
    if (isEdit || didAutoOpenCategory.current) {
      return
    }
    didAutoOpenCategory.current = true
    openPicker("category")
  }, [isEdit, openPicker])

  function clearIncompatibleCategory(next: MovementType) {
    const expected = categoryTypeForTransaction(next)
    const current = categories.find(
      (item) => item.id === getValues("categoryId")
    )
    if (current && current.type !== expected) {
      setValue("categoryId", CATALOG_NONE)
      openPicker("category")
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (isTransferLeg) {
      return
    }
    const target = splitLedgerTarget(values.destination)
    const payload = buildCreateTransactionBody(
      {
        ...values,
        transactionDate: wallClockToIso(values.transactionDate),
        accountId: target.accountId,
        cardId: target.cardId,
      },
      { isUpdate: isEdit }
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
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  if (isTransferLeg) {
    return (
      <p className="text-sm text-muted-foreground">
        Las transferencias no se editan por pierna. Elimínalas o confírmalas
        desde el detalle.
      </p>
    )
  }

  const categoryType = categoryTypeForTransaction(type)
  if (!categoryType) {
    throw new Error(`Tipo de movimiento sin categoría: ${type}`)
  }

  const cta = isEdit
    ? "Guardar"
    : type === "CREDIT"
      ? "Registrar ingreso"
      : "Registrar gasto"
  const paidLabel = type === "CREDIT" ? "Recibido" : "Pagado"

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel={cta}
        submitIcon={SaveIcon}
        isSubmitting={isPending}
        submitDisabled={!canSave}
      >
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <FinanceSegmentedControl
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                onTypeChange?.(next)
                clearIncompatibleCategory(next)
              }}
              options={TYPE_OPTIONS}
              size="lg"
              fullWidth
            />
          )}
        />

        <SummarySection title="Movimiento" icon={ArrowDownCircleIcon}>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Categoría
            </FieldLabel>
            <CategoryTrigger
              category={selectedCategory}
              onClick={() => openPicker("category")}
            />
          </Field>

          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <FinanceMoneyField
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("amount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.amount?.message}
                currency={currency || defaultCurrency}
                currencyError={errors.currency?.message}
                onCurrencyPress={() => openPicker("currency")}
              />
            )}
          />

          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Destino
            </FieldLabel>
            <DestinationTrigger
              destination={destination}
              accounts={accounts}
              cards={cards}
              display={display}
              disabled={!hasTargets}
              onClick={() => openPicker("destination")}
            />
            {errors.destination?.message ? (
              <FieldError>{errors.destination.message}</FieldError>
            ) : null}
          </Field>

          <Controller
            control={control}
            name="transactionDate"
            render={({ field }) => (
              <FinanceDateField
                label="Fecha y hora"
                value={field.value}
                onChange={field.onChange}
                error={errors.transactionDate?.message}
                withTime
                aside={
                  <Controller
                    control={control}
                    name="status"
                    render={({ field: statusField }) => (
                      <Field
                        orientation="horizontal"
                        className="h-11 w-auto shrink-0 gap-2 rounded-xl border border-border bg-card px-3"
                      >
                        <FieldLabel
                          htmlFor={statusSwitchId}
                          className="text-sm font-medium"
                        >
                          {paidLabel}
                        </FieldLabel>
                        <Switch
                          id={statusSwitchId}
                          checked={statusField.value === "CONFIRMED"}
                          onCheckedChange={(checked) =>
                            statusField.onChange(
                              checked ? "CONFIRMED" : "PENDING"
                            )
                          }
                        />
                      </Field>
                    )}
                  />
                }
              />
            )}
          />

          <Controller
            control={control}
            name="merchant"
            render={({ field }) => (
              <FormTextField
                label={type === "CREDIT" ? "Origen" : "Comercio"}
                icon={type === "CREDIT" ? HandCoinsIcon : StoreIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.merchant?.message}
              />
            )}
          />
        </SummarySection>

        <SummarySection
          title="Detalles opcionales"
          icon={InfoIcon}
          collapsible
          defaultOpen={isEdit}
        >
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <FormTextField
                label="Descripción"
                icon={FileTextIcon}
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
                icon={NotebookPenIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </SummarySection>

        {!hasTargets && !accountsQuery.isPending && !cardsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Crea una cuenta o tarjeta para poder guardar el movimiento.
          </p>
        ) : null}
      </FinanceFormScreen>

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType={categoryType}
        onSelect={(next) => setValue("categoryId", next)}
      />

      <CurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        enabled={enabled}
        codes={currencyCodes}
        quotes={currencyQuotes}
        quoteCurrency={baseCurrency}
        showNames
        onSelect={(next) => setValue("currency", next)}
      />

      <DestinationPickerSheet
        open={picker === "destination"}
        onOpenChange={closeHandlerFor("destination")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={{ ...display, currency: currency || display.currency }}
        onSelect={(next) =>
          setValue("destination", next, { shouldValidate: true })
        }
      />
    </>
  )
}

function CategoryTrigger({
  category,
  onClick,
}: {
  category: FinanceCategory | null
  onClick: () => void
}) {
  if (!category) {
    return (
      <CategoryCard
        name="Sin categoría"
        icon={null}
        isSystem={false}
        variant="pick"
        onPress={onClick}
      />
    )
  }
  return (
    <CategoryCard
      name={category.name}
      icon={category.icon}
      color={category.color}
      isSystem={category.isSystem}
      onPress={onClick}
    />
  )
}
