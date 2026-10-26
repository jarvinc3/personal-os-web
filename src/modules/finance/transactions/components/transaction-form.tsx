"use client"

import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import type { FinanceMoneyFieldHandle } from "@/src/modules/finance/shared/components/forms/money-field"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useBudgetStatus } from "@/src/modules/finance/shared/hooks/use-analytics"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useCurrencyForTarget } from "@/src/modules/finance/shared/hooks/use-currency-for-target"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useMerchantSuggest } from "@/src/modules/finance/shared/hooks/use-merchants"
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
import { wallClockToIso } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  buildCreateTransactionBody,
  buildTransactionMetadataBody,
  encodeLedgerTarget,
  splitLedgerTarget,
  type CreateTransactionBody,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { TransactionAmountField } from "@/src/modules/finance/transactions/components/transaction-amount-field"
import { LedgerDateStatusField } from "@/src/modules/finance/transactions/components/ledger-date-status-field"
import { TransactionDestinationField } from "@/src/modules/finance/transactions/components/transaction-destination-field"
import { TransactionDetailsSection } from "@/src/modules/finance/transactions/components/transaction-form-details"
import {
  TransactionFormSheets,
  type TransactionFormPicker,
} from "@/src/modules/finance/transactions/components/transaction-form-sheets"
import { TransactionMerchantField } from "@/src/modules/finance/transactions/components/transaction-merchant-field"
import {
  isTransactionMetadataOnly,
  isTransactionReadOnly,
} from "@/src/modules/finance/transactions/lib/transaction-edit"
import {
  EMPTY_TRANSACTION_PREFILL,
  type TransactionPrefill,
} from "@/src/modules/finance/transactions/lib/transaction-prefill"
import {
  toFormValues,
  type MovementType,
} from "@/src/modules/finance/transactions/lib/transaction-form-values"
import { assessExpenseBalance } from "@/src/modules/finance/transactions/lib/expense-balance"
import {
  budgetOverageForExpense,
  type BudgetOverage,
} from "@/src/modules/finance/transactions/lib/budget-overage"
import type { TransactionFormValues } from "@/src/modules/finance/transactions/lib/transaction-form"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CircleAlertIcon,
  LockIcon,
  SaveIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { transactionSchema } from "@/src/modules/finance/transactions/lib/transaction-form"

type GuidedStep = "category" | "amount" | "destination" | "done"

const TYPE_OPTIONS = [
  { value: "DEBIT" as const, label: "Gasto", icon: ArrowDownCircleIcon },
  { value: "CREDIT" as const, label: "Ingreso", icon: ArrowUpCircleIcon },
]

type TransactionFormProps = {
  mode: "create" | "edit"
  initialType: MovementType
  initialDestination?: string | null
  initialPrefill?: TransactionPrefill
  transaction: FinanceTransaction | null
  defaultCurrency: string
  defaultAccountId?: string | null
  enabled: boolean
  display: FinanceMoneyDisplay
  onTypeChange?: (type: MovementType) => void
  onDone: () => void
}

type PendingOverdraft = {
  body: CreateTransactionBody
  accountName: string
  accountCurrency: string
  projectedBalance: number
}

type PendingBudgetOverage = {
  body: CreateTransactionBody
  values: TransactionFormValues
  account: FinanceAccount | null
  overage: BudgetOverage
}

export function TransactionForm({
  mode,
  initialType,
  initialDestination = null,
  initialPrefill = EMPTY_TRANSACTION_PREFILL,
  transaction,
  defaultCurrency,
  defaultAccountId = null,
  enabled,
  display,
  onTypeChange,
  onDone,
}: TransactionFormProps) {
  const isEdit = mode === "edit"
  const isTransferLeg =
    Boolean(transaction?.transferGroupId) || transaction?.type === "TRANSFER"
  const metadataOnly =
    isEdit && transaction !== null && isTransactionMetadataOnly(transaction)
  const readOnly =
    isEdit && transaction !== null && isTransactionReadOnly(transaction)
  const locked = metadataOnly || readOnly
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const categoriesQuery = useCategories(enabled)
  const budgetStatusQuery = useBudgetStatus(enabled)
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
  const { picker, openPicker, closeHandlerFor } =
    usePicker<TransactionFormPicker>("none")
  const timeZone = useUserTimeZone()
  const statusSwitchId = useId()
  const { amountEntry, setAmountEntry } = useFinanceAmountEntry()
  const [guidedStep, setGuidedStep] = useState<GuidedStep>(() =>
    isEdit ? "done" : "category"
  )
  const amountFieldRef = useRef<FinanceMoneyFieldHandle>(null)
  const guidedDestinationOpened = useRef(false)
  const [pendingOverdraft, setPendingOverdraft] =
    useState<PendingOverdraft | null>(null)
  const [pendingBudgetOverage, setPendingBudgetOverage] =
    useState<PendingBudgetOverage | null>(null)

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
    defaultValues: toFormValues({
      transaction,
      initialType,
      defaultCurrency,
      defaultDestination: CATALOG_NONE,
      prefill: initialPrefill,
    }),
  })

  const formValues = useWatch({ control })
  const formIsValid = transactionSchema.safeParse(formValues).success
  const destination = useWatch({ control, name: "destination" })
  const type = useWatch({ control, name: "type" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const currency = useWatch({ control, name: "currency" })
  const targetsReady = accountsQuery.isSuccess && cardsQuery.isSuccess
  const canSave =
    !isPending && formIsValid && (isEdit || (targetsReady && hasTargets))

  const selectedCategory =
    categories.find((item) => item.id === categoryId) ?? null

  const merchantName = useWatch({ control, name: "merchant" })
  const [debouncedMerchant, setDebouncedMerchant] = useState("")
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedMerchant(merchantName),
      300
    )
    return () => window.clearTimeout(timer)
  }, [merchantName])
  const merchantSuggestQuery = useMerchantSuggest(
    enabled && !locked && Boolean(debouncedMerchant.trim()),
    debouncedMerchant
  )
  const merchantSuggestion = merchantSuggestQuery.data ?? null
  const merchantSuggestionCategoryName = merchantSuggestion?.categoryId
    ? (categories.find((item) => item.id === merchantSuggestion.categoryId)
        ?.name ?? null)
    : null

  const applyMerchantSuggestion = useCallback(
    (suggestedName: string, suggestedCategoryId: string | null) => {
      setValue("merchant", suggestedName, {
        shouldDirty: true,
        shouldValidate: true,
      })
      if (suggestedCategoryId && getValues("categoryId") === CATALOG_NONE) {
        setValue("categoryId", suggestedCategoryId, { shouldDirty: true })
      }
    },
    [getValues, setValue]
  )

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
      toFormValues({
        transaction: isEdit ? transaction : null,
        initialType,
        defaultCurrency,
        defaultDestination: getValues("destination") || CATALOG_NONE,
        prefill: initialPrefill,
      })
    )
  }, [
    isEdit,
    transaction,
    initialType,
    defaultCurrency,
    reset,
    getValues,
    initialPrefill,
  ])

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
    const defaultTarget = defaultAccountId
      ? encodeLedgerTarget("account", defaultAccountId)
      : null
    if (defaultTarget && isKnownLedgerTarget(defaultTarget, accounts, cards)) {
      if (getValues("destination") !== defaultTarget) {
        setValue("destination", defaultTarget)
      }
      return
    }
    if (next !== CATALOG_NONE) {
      setValue("destination", next)
    }
  }, [
    groups,
    accounts,
    cards,
    initialDestination,
    defaultAccountId,
    isEdit,
    getValues,
    setValue,
    accountsQuery.isSuccess,
    cardsQuery.isSuccess,
    institutionsQuery.isSuccess,
  ])

  useEffect(() => {
    if (
      isEdit ||
      guidedStep !== "destination" ||
      guidedDestinationOpened.current
    ) {
      return
    }
    guidedDestinationOpened.current = true
    openPicker("destination")
  }, [isEdit, guidedStep, openPicker])

  function advanceToAmount() {
    if (isEdit || guidedStep !== "category") {
      return
    }
    setGuidedStep("amount")
    window.setTimeout(() => amountFieldRef.current?.focusAmount(), 0)
  }

  /** The amount is the step that sends the form to the destination. */
  function advanceToDestination() {
    if (isEdit) {
      return
    }
    const amount = parseFinanceMoney(getValues("amount"))
    if (amount === null || amount <= 0) {
      return
    }
    setGuidedStep("destination")
  }

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

  async function submitTransactionBody(body: CreateTransactionBody) {
    try {
      if (transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, body })
        appToast.success({ text1: "Movimiento actualizado" })
      } else {
        await createMutation.mutateAsync(body)
        appToast.success({ text1: "Movimiento creado" })
      }
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function submitAfterBudgetWarning({
    body,
    values,
    account,
  }: {
    body: CreateTransactionBody
    values: TransactionFormValues
    account: FinanceAccount | null
  }) {
    if (values.type === "DEBIT" && account) {
      const verdict = assessExpenseBalance({
        accountType: account.type,
        balance: account.balance,
        amount: values.amount,
        accountCurrency: account.currency,
        transactionCurrency: values.currency,
      })
      if (verdict.status === "blocked") {
        appToast.error({
          text1: "El efectivo no puede quedar negativo",
          text2: `Saldo disponible: ${formatFinanceMoney(account.balance, { ...display, currency: account.currency })}.`,
        })
        return
      }
      if (verdict.status === "confirm") {
        setPendingOverdraft({
          body,
          accountName: account.name,
          accountCurrency: account.currency,
          projectedBalance: verdict.projectedBalance,
        })
        return
      }
    }

    await submitTransactionBody(body)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (isTransferLeg) {
      return
    }
    if (metadataOnly && transaction) {
      try {
        await updateMutation.mutateAsync({
          id: transaction.id,
          body: buildTransactionMetadataBody(values),
        })
        appToast.success({ text1: "Movimiento actualizado" })
        onDone()
      } catch (error) {
        appToast.error({ text1: financeErrorMessage(error) })
      }
      return
    }
    const target = splitLedgerTarget(values.destination)
    const payload = buildCreateTransactionBody(
      {
        ...values,
        transactionDate: wallClockToIso(values.transactionDate, timeZone),
        accountId: target.accountId,
        cardId: target.cardId,
      },
      { isUpdate: isEdit }
    )
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }

    const account = target.accountId
      ? (accounts.find((item) => item.id === target.accountId) ?? null)
      : null
    const budgets =
      budgetStatusQuery.data ?? (await budgetStatusQuery.refetch()).data ?? []
    const overage =
      !isEdit && values.type === "DEBIT" && values.currency === display.currency
        ? budgetOverageForExpense({
            budgets,
            categoryId: values.categoryId,
            date: values.transactionDate,
            amount: values.amount,
          })
        : null
    if (overage) {
      setPendingBudgetOverage({
        body: payload.body,
        values,
        account,
        overage,
      })
      return
    }

    await submitAfterBudgetWarning({
      body: payload.body,
      values,
      account,
    })
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
  const destinationLabel = type === "CREDIT" ? "Destino" : "Desde"

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel={cta}
        submitIcon={SaveIcon}
        isSubmitting={isPending}
        submitDisabled={!canSave || readOnly}
      >
        {locked ? (
          <p className="flex items-start gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {readOnly
              ? "Este movimiento ya no se puede editar."
              : "Este movimiento está completado. Solo puedes cambiar categoría, comercio, descripción y notas."}
          </p>
        ) : null}

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                onTypeChange?.(next)
                clearIncompatibleCategory(next)
              }}
              options={TYPE_OPTIONS}
              size="lg"
              fullWidth
              disabled={locked}
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

          <TransactionAmountField
            control={control}
            errors={errors}
            currency={currency}
            defaultCurrency={defaultCurrency}
            locked={locked}
            entryMode={amountEntry}
            onEntryModeChange={setAmountEntry}
            amountRef={amountFieldRef}
            onCommit={() => {
              void trigger("amount")
              advanceToDestination()
            }}
            onBlur={advanceToDestination}
            onCurrencyPress={() => openPicker("currency")}
          />

          <TransactionDestinationField
            destination={destination}
            label={destinationLabel}
            accounts={accounts}
            cards={cards}
            display={display}
            disabled={!hasTargets || locked}
            error={errors.destination?.message}
            onOpen={() => openPicker("destination")}
          />

          <Controller
            control={control}
            name="transactionDate"
            render={({ field }) => (
              <Controller
                control={control}
                name="status"
                render={({ field: statusField }) => (
                  <LedgerDateStatusField
                    date={{
                      value: field.value,
                      error: errors.transactionDate?.message,
                      disabled: locked,
                      onChange: field.onChange,
                    }}
                    status={{
                      value: statusField.value,
                      label: paidLabel,
                      switchId: statusSwitchId,
                      disabled: locked,
                      onChange: statusField.onChange,
                    }}
                  />
                )}
              />
            )}
          />

          <TransactionMerchantField
            control={control}
            errors={errors}
            type={type}
            suggestion={merchantSuggestion}
            suggestionCategoryName={merchantSuggestionCategoryName}
            onApplySuggestion={applyMerchantSuggestion}
          />
        </SummarySection>

        <TransactionDetailsSection control={control} openByDefault={isEdit} />

        {!hasTargets && !accountsQuery.isPending && !cardsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Crea una cuenta o tarjeta para poder guardar el movimiento.
          </p>
        ) : null}
      </FinanceFormScreen>

      <TransactionFormSheets
        picker={picker}
        closeHandlerFor={closeHandlerFor}
        categories={categories}
        categoryType={categoryType}
        currency={currency}
        defaultCurrency={defaultCurrency}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={display}
        onSelectCategory={(next) => {
          setValue("categoryId", next)
          advanceToAmount()
        }}
        onSelectCurrency={(next) => setValue("currency", next)}
        onSelectDestination={(next) => {
          setValue("destination", next, { shouldValidate: true })
          setGuidedStep("done")
        }}
      />

      <ConfirmDialog
        open={pendingBudgetOverage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingBudgetOverage(null)
          }
        }}
        icon={CircleAlertIcon}
        title="Este gasto excede el presupuesto"
        description={
          pendingBudgetOverage
            ? `${pendingBudgetOverage.overage.budget.category}: el exceso queda en ${formatFinanceMoney(pendingBudgetOverage.overage.excess, display)}. ¿Registrar el gasto igual?`
            : null
        }
        confirmLabel="Registrar igual"
        confirmIcon={CircleAlertIcon}
        pending={isPending}
        pendingLabel="Registrando..."
        onConfirm={() => {
          const pending = pendingBudgetOverage
          setPendingBudgetOverage(null)
          if (pending) {
            void submitAfterBudgetWarning({
              body: pending.body,
              values: pending.values,
              account: pending.account,
            })
          }
        }}
      />

      <ConfirmDialog
        open={pendingOverdraft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingOverdraft(null)
          }
        }}
        icon={TriangleAlertIcon}
        title="¿Registrar un gasto mayor que el saldo?"
        description={
          pendingOverdraft
            ? `La cuenta ${pendingOverdraft.accountName} quedaría en ${formatFinanceMoney(pendingOverdraft.projectedBalance, { ...display, currency: pendingOverdraft.accountCurrency })}.`
            : null
        }
        confirmLabel={isEdit ? "Guardar" : "Registrar"}
        confirmIcon={SaveIcon}
        pending={isPending}
        pendingLabel="Guardando..."
        onConfirm={() => {
          const pending = pendingOverdraft
          setPendingOverdraft(null)
          if (pending) {
            void submitTransactionBody(pending.body)
          }
        }}
      />
    </>
  )
}
