"use client"

import { CategoryCard } from "@/src/modules/finance/components/catalog/category-card"
import { CurrencyTriggerLabel } from "@/src/modules/finance/components/currency-flag"
import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field"
import {
  FinanceAmountField,
  FinanceSegmentedControl,
} from "@/src/modules/finance/components/forms/finance-form-blocks"
import { AmountCalculatorSheet } from "@/src/modules/finance/components/transactions/amount-calculator-sheet"
import { CategoryPickerSheet } from "@/src/modules/finance/components/transactions/category-picker-sheet"
import { CurrencyPickerSheet } from "@/src/modules/finance/components/transactions/currency-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/components/transactions/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/components/transactions/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/src/modules/finance/hooks/use-transactions"
import {
  buildDestinationPickerGroups,
  type DestinationPickerGroup,
} from "@/src/modules/finance/lib/destination-picker"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { narrowCurrencySymbol } from "@/src/modules/finance/lib/money"
import { categoryTypeForTransaction } from "@/src/modules/finance/lib/category-tree"
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
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import type {
  FinanceCategory,
  FinanceTransaction,
} from "@/src/modules/finance/types/entities"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CalculatorIcon,
  FileTextIcon,
  HandCoinsIcon,
  InfoIcon,
  KeyboardIcon,
  NotebookPenIcon,
  StoreIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
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
type MovementType = FormValues["type"]
type Picker = "none" | "category" | "calculator" | "currency" | "destination"

const TYPE_OPTIONS = [
  { value: "DEBIT" as const, label: "Gasto", icon: ArrowDownCircleIcon },
  { value: "CREDIT" as const, label: "Ingreso", icon: ArrowUpCircleIcon },
]

function destinationFromTransaction(tx: FinanceTransaction | null): string {
  if (tx?.cardId) return encodeLedgerTarget("card", tx.cardId)
  if (tx?.accountId) return encodeLedgerTarget("account", tx.accountId)
  return CATALOG_NONE
}

function toFormValues(
  tx: FinanceTransaction | null,
  initialType: MovementType,
  defaultCurrency: string,
  defaultDestination: string,
): FormValues {
  return {
    type: tx?.type === "CREDIT" ? "CREDIT" : tx ? "DEBIT" : initialType,
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

function firstLedgerTarget(groups: DestinationPickerGroup[]): string {
  for (const group of groups) {
    if (group.kind === "cash") {
      return encodeLedgerTarget("account", group.account.id)
    }
  }
  for (const group of groups) {
    if (group.kind !== "institution") continue
    const account = group.accounts[0]
    if (account) return encodeLedgerTarget("account", account.id)
    const card = group.cards[0]
    if (card) return encodeLedgerTarget("card", card.id)
  }
  return CATALOG_NONE
}

type TransactionFormProps = {
  mode: "create" | "edit"
  initialType: MovementType
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
  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  )
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )
  const institutions = useMemo(
    () => institutionsQuery.data ?? [],
    [institutionsQuery.data],
  )
  const isPending = createMutation.isPending || updateMutation.isPending
  const hasTargets = accounts.length > 0 || cards.length > 0
  const groups = useMemo(
    () => buildDestinationPickerGroups({ institutions, accounts, cards }),
    [institutions, accounts, cards],
  )
  const [picker, setPicker] = useState<Picker>("none")
  const [amountMode, setAmountMode] = useState<"keyboard" | "calculator">(
    "keyboard",
  )
  const didAutoOpenCategory = useRef(false)
  const currencyDestination = useRef<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(
      transaction,
      initialType,
      defaultCurrency,
      CATALOG_NONE,
    ),
  })

  const destination = useWatch({ control, name: "destination" })
  const type = useWatch({ control, name: "type" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const amount = useWatch({ control, name: "amount" })
  const currency = useWatch({ control, name: "currency" })
  const categoryType = categoryTypeForTransaction(type) ?? "EXPENSE"
  const selectedCategory = categories.find((item) => item.id === categoryId) ?? null

  useEffect(() => {
    if (isEdit && !transaction) return
    reset(
      toFormValues(
        isEdit ? transaction : null,
        initialType,
        defaultCurrency,
        getValues("destination") || CATALOG_NONE,
      ),
    )
  }, [
    isEdit,
    transaction,
    initialType,
    defaultCurrency,
    reset,
    getValues,
  ])

  useEffect(() => {
    if (isEdit) return
    if (
      !accountsQuery.isSuccess ||
      !cardsQuery.isSuccess ||
      !institutionsQuery.isSuccess
    ) {
      return
    }
    const current = getValues("destination")
    if (current && current !== CATALOG_NONE) return
    const next = firstLedgerTarget(groups)
    if (next !== CATALOG_NONE) setValue("destination", next)
  }, [
    groups,
    isEdit,
    getValues,
    setValue,
    accountsQuery.isSuccess,
    cardsQuery.isSuccess,
    institutionsQuery.isSuccess,
  ])

  useEffect(() => {
    if (isEdit) return
    if (currencyDestination.current === destination) return
    currencyDestination.current = destination
    setValue(
      "currency",
      currencyForTarget(destination, accounts, cards, defaultCurrency),
    )
  }, [isEdit, destination, accounts, cards, defaultCurrency, setValue])

  useEffect(() => {
    if (isEdit || didAutoOpenCategory.current) return
    didAutoOpenCategory.current = true
    setPicker("category")
  }, [isEdit])

  function openPicker(next: Picker) {
    setPicker(next)
  }

  function clearIncompatibleCategory(next: MovementType) {
    const expected = categoryTypeForTransaction(next)
    const current = categories.find((item) => item.id === getValues("categoryId"))
    if (current && current.type !== expected) {
      setValue("categoryId", CATALOG_NONE)
      openPicker("category")
    }
  }

  const onSubmit = handleSubmit(async (values) => {
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

  const cta = isEdit
    ? "Guardar"
    : type === "CREDIT"
      ? "Registrar ingreso"
      : "Registrar gasto"
  const paidLabel = type === "CREDIT" ? "Recibido" : "Pagado"

  return (
    <>
      <form
        className="-mb-4 flex h-[calc(100dvh-var(--header-height)-1rem)] flex-col gap-4 md:-mb-16"
        onSubmit={onSubmit}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
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
          <CategoryTrigger
            category={selectedCategory}
            onClick={() => openPicker("category")}
          />

          <div>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <FinanceAmountField
                      label={null}
                      prefix={narrowCurrencySymbol(currency || defaultCurrency)}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.amount?.message}
                      readOnly={amountMode === "calculator"}
                      onReadOnlyActivate={() => openPicker("calculator")}
                      trailing={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-pressed={amountMode === "calculator"}
                          aria-label={
                            amountMode === "calculator"
                              ? "Usar teclado"
                              : "Abrir calculadora"
                          }
                          onClick={() => {
                            if (amountMode === "keyboard") {
                              setAmountMode("calculator")
                              openPicker("calculator")
                              return
                            }
                            setAmountMode("keyboard")
                            if (picker === "calculator") setPicker("none")
                          }}
                        >
                          {amountMode === "calculator" ? (
                            <CalculatorIcon />
                          ) : (
                            <KeyboardIcon />
                          )}
                        </Button>
                      }
                    />
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-14 shrink-0 rounded-2xl px-3 text-base"
                onClick={() => openPicker("currency")}
              >
                <CurrencyTriggerLabel code={currency || defaultCurrency} />
              </Button>
            </div>
            {errors.currency?.message ? (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            ) : null}
          </div>

          <div>
            <DestinationTrigger
              destination={destination}
              accounts={accounts}
              cards={cards}
              disabled={!hasTargets}
              onClick={() => openPicker("destination")}
            />
            {errors.destination?.message && destination === CATALOG_NONE ? (
              <p className="-mt-2 text-sm text-destructive">
                {errors.destination.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Controller
                control={control}
                name="transactionDate"
                render={({ field }) => (
                  <FinanceDateField
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.transactionDate?.message}
                  />
                )}
              />
            </div>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3">
                  <span className="text-sm font-medium">{paidLabel}</span>
                  <Switch
                    checked={field.value === "CONFIRMED"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "CONFIRMED" : "PENDING")
                    }
                    aria-label={paidLabel}
                  />
                </label>
              )}
            />
          </div>

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
                placeholder={type === "CREDIT" ? "Origen del ingreso" : "Supermercado"}
              />
            )}
          />
        </SummarySection>

        <SummarySection title="Detalles opcionales" icon={InfoIcon} collapsible defaultOpen={isEdit}>
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
        </div>

        <div className="shrink-0 border-t bg-background px-0 pt-3 pb-4">
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isPending || (!isEdit && !hasTargets)}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            {cta}
          </Button>
        </div>
      </form>

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={(open) => {
          if (open) return
          setPicker((current) => (current === "category" ? "none" : current))
        }}
        categories={categories}
        categoryType={categoryType}
        onSelect={(next) => setValue("categoryId", next)}
      />
      <AmountCalculatorSheet
        open={picker === "calculator"}
        onOpenChange={(open) => {
          setPicker((current) => {
            if (open) return "calculator"
            return current === "calculator" ? "none" : current
          })
        }}
        amount={amount}
        currency={currency || defaultCurrency}
        onCommit={(next) => setValue("amount", next, { shouldValidate: true })}
      />
      <CurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={(open) => {
          if (open) return
          setPicker((current) => (current === "currency" ? "none" : current))
        }}
        value={currency || defaultCurrency}
        enabled={enabled}
        onSelect={(next) => setValue("currency", next)}
      />
      <DestinationPickerSheet
        open={picker === "destination"}
        onOpenChange={(open) => {
          if (open) return
          setPicker((current) => (current === "destination" ? "none" : current))
        }}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={{ ...display, currency: currency || display.currency }}
        onSelect={(next) => setValue("destination", next, { shouldValidate: true })}
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

