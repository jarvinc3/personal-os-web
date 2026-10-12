"use client"

import {
  FinanceDateField,
  formatFinanceDateLabel,
} from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceHelpText,
  FinanceSegmentedControl,
  FinanceSuggestionRow,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useCreateBudget,
  useUpdateBudget,
} from "@/src/modules/finance/shared/hooks/use-budgets"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { useAllTransactions } from "@/src/modules/finance/shared/hooks/use-transactions"
import {
  boundsForPeriod,
  buildCreateBudgetBody,
} from "@/src/modules/finance/shared/lib/budget-payloads"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { previousMonthsBounds } from "@/src/modules/finance/shared/lib/month-window"
import { visibleTransactionTotals } from "@/src/modules/finance/shared/lib/transactions-query"
import type {
  FinanceBudget,
  FinanceBudgetPeriod,
  FinanceCategory,
} from "@/src/modules/finance/shared/types/entities"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  FINANCE_BUDGET_PERIODS,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PiggyBankIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  budgetSchema,
  type BudgetFormValues,
} from "@/src/modules/finance/budgets/lib/budget-form"

const PERIOD_OPTIONS = FINANCE_BUDGET_PERIODS.map((value) => ({
  value,
  label: FINANCE_BUDGET_PERIOD_LABEL[value],
}))

const THRESHOLD_OPTIONS = [
  { value: "50", label: "50 %" },
  { value: "80", label: "80 %" },
  { value: "100", label: "100 %" },
]

function toFormValues(
  budget: FinanceBudget | null,
  defaultCategoryId: string
): BudgetFormValues {
  const month = boundsForPeriod("MONTHLY")
  return {
    categoryId: budget?.categoryId ?? defaultCategoryId,
    periodType: budget?.periodType ?? "MONTHLY",
    periodStart: budget?.periodStart?.slice(0, 10) ?? month.periodStart,
    periodEnd: budget?.periodEnd?.slice(0, 10) ?? month.periodEnd,
    amountLimit: budget?.amountLimit ?? "",
    alertThresholdPct:
      budget?.alertThresholdPct !== undefined
        ? String(budget.alertThresholdPct)
        : "80",
  }
}

type BudgetSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget: FinanceBudget | null
  categories: FinanceCategory[]
  pending?: boolean
}

export function BudgetSheet({
  open,
  onOpenChange,
  budget,
  categories,
  pending = false,
}: BudgetSheetProps) {
  const isEdit = Boolean(budget)
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const isPending = createMutation.isPending || updateMutation.isPending
  const { config } = useFinanceEnabled()
  const baseCurrency = config.baseCurrency
  const expenseCategories = useMemo(() => {
    const filtered = filterCategoriesByType(categories, "EXPENSE")
    if (
      budget?.categoryId &&
      !filtered.some((category) => category.id === budget.categoryId)
    ) {
      const current = categories.find(
        (category) => category.id === budget.categoryId
      )
      return current ? [current, ...filtered] : filtered
    }
    return filtered
  }, [budget, categories])
  const hasCategories = expenseCategories.length > 0
  const defaultCategoryId = expenseCategories[0]?.id ?? ""

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: toFormValues(budget, defaultCategoryId),
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })
  const categoryId = useWatch({ control, name: "categoryId" })
  const selectedCategory =
    expenseCategories.find((category) => category.id === categoryId) ?? null
  const display = {
    currency: baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const historyRange = useMemo(() => previousMonthsBounds(new Date(), 3), [])
  const historyQuery = useAllTransactions(open && Boolean(categoryId), {
    categoryId,
    type: "DEBIT",
    dateFrom: historyRange.dateFrom,
    dateTo: historyRange.dateTo,
  })
  const averageMonthlySpend = useMemo(() => {
    const items = historyQuery.data ?? []
    if (items.length === 0) {
      return null
    }
    const { expenses } = visibleTransactionTotals(items)
    return expenses > 0 ? expenses / 3 : null
  }, [historyQuery.data])
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "category"
  >("none")
  const periodType = useWatch({ control, name: "periodType" })
  const periodStart = useWatch({ control, name: "periodStart" })
  const periodEnd = useWatch({ control, name: "periodEnd" })
  const isCustom = periodType === "CUSTOM"

  useEffect(() => {
    if (open) {
      reset(toFormValues(budget, defaultCategoryId))
    }
  }, [open, budget, defaultCategoryId, reset])

  useEffect(() => {
    if (!open || budget || periodType === "CUSTOM") {
      return
    }
    const bounds = boundsForPeriod(periodType)
    setValue("periodStart", bounds.periodStart)
    setValue("periodEnd", bounds.periodEnd)
  }, [open, budget, periodType, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateBudgetBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (budget) {
        await updateMutation.mutateAsync({ id: budget.id, body: payload.body })
        appToast.success({ text1: "Presupuesto actualizado" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Presupuesto creado" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        pending={pending}
        title={isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
        description={
          hasCategories
            ? "El tope es por categoría y periodo. El gasto se calcula con los movimientos."
            : "Crea una categoría antes de agregar un presupuesto."
        }
        actions={{
          close: (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => requestOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              type="button"
              disabled={isPending || (!isEdit && !hasCategories)}
              className="flex-1"
              onClick={onSubmit}
            >
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Guardar
            </Button>
          ),
        }}
      >
        <SummarySection title="Presupuesto" icon={PiggyBankIcon}>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Categoría
            </FieldLabel>
            <CategoryTrigger
              category={selectedCategory}
              placeholder={
                hasCategories ? "Elige categoría" : "Crea una categoría primero"
              }
              disabled={!hasCategories}
              onClick={() => openPicker("category")}
            />
            {errors.categoryId?.message ? (
              <FieldError>{errors.categoryId.message}</FieldError>
            ) : null}
          </Field>
          <Controller
            control={control}
            name="amountLimit"
            render={({ field }) => (
              <FinanceMoneyField
                label="Tope"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("amountLimit")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.amountLimit?.message}
                currency={baseCurrency}
              />
            )}
          />
          {averageMonthlySpend ? (
            <FinanceSuggestionRow
              actionLabel="Usar"
              onAction={() =>
                setValue(
                  "amountLimit",
                  String(Math.round(averageMonthlySpend)),
                  { shouldValidate: true }
                )
              }
            >
              {`Gastas ~${formatFinanceMoney(averageMonthlySpend, display)}/mes · promedio 3 meses`}
            </FinanceSuggestionRow>
          ) : null}
          <Controller
            control={control}
            name="alertThresholdPct"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Avisarme al"
                value={field.value}
                onChange={field.onChange}
                options={THRESHOLD_OPTIONS}
                error={errors.alertThresholdPct?.message}
              />
            )}
          />
        </SummarySection>
        <SummarySection title="Periodo" icon={CalendarIcon}>
          <Controller
            control={control}
            name="periodType"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Tipo"
                value={field.value}
                onChange={(value) =>
                  field.onChange(value as FinanceBudgetPeriod)
                }
                options={PERIOD_OPTIONS}
              />
            )}
          />
          {isCustom ? (
            <>
              <Controller
                control={control}
                name="periodStart"
                render={({ field }) => (
                  <FinanceDateField
                    label="Desde"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="periodEnd"
                render={({ field }) => (
                  <FinanceDateField
                    label="Hasta"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </>
          ) : (
            <FinanceHelpText>
              {formatFinanceDateLabel(periodStart)} —{" "}
              {formatFinanceDateLabel(periodEnd)}
            </FinanceHelpText>
          )}
        </SummarySection>
      </BottomSheet>

      {discardChangesDialog}

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={expenseCategories}
        categoryType="EXPENSE"
        onSelect={(next) =>
          setValue("categoryId", next, { shouldValidate: true })
        }
      />
    </>
  )
}
