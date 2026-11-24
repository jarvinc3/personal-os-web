"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import {
  FinanceDateField,
  formatFinanceDateLabel,
} from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceHelpText,
  FinanceSuggestionRow,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CategoryMultiTrigger } from "@/src/modules/finance/shared/components/pickers/category-multi-trigger"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useCreateCategory } from "@/src/modules/finance/shared/hooks/use-categories"
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
import { removeCategoryId } from "@/src/modules/finance/shared/lib/category-selection"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { previousMonthsBounds } from "@/src/modules/finance/shared/lib/month-window"
import { visibleTransactionTotals } from "@/src/modules/finance/shared/lib/transactions-query"
import type {
  FinanceBudget,
  FinanceCategory,
} from "@/src/modules/finance/shared/types/entities"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  FINANCE_BUDGET_PERIODS,
  FINANCE_BUDGET_ROLLOVER_LABEL,
  FINANCE_BUDGET_ROLLOVERS,
} from "@/src/modules/finance/shared/types/entities"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PiggyBankIcon, XIcon } from "lucide-react"
import { useEffect, useId, useMemo } from "react"
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

const ROLLOVER_OPTIONS = FINANCE_BUDGET_ROLLOVERS.map((value) => ({
  value,
  label: FINANCE_BUDGET_ROLLOVER_LABEL[value],
}))

function budgetCategoryIds(budget: FinanceBudget | null): string[] {
  if (!budget) {
    return []
  }
  if (budget.categories && budget.categories.length > 0) {
    return budget.categories.map((category) => category.id)
  }
  return budget.categoryId ? [budget.categoryId] : []
}

function toFormValues({
  budget,
  monthStartDay,
}: {
  budget: FinanceBudget | null
  monthStartDay: number
}): BudgetFormValues {
  const month = boundsForPeriod("MONTHLY", { monthStartDay })
  const categoryIds = budgetCategoryIds(budget)
  return {
    categoryIds,
    periodType: budget?.periodType ?? "MONTHLY",
    periodStart: budget?.periodStart?.slice(0, 10) ?? month.periodStart,
    periodEnd: budget?.periodEnd?.slice(0, 10) ?? month.periodEnd,
    amountLimit: budget?.amountLimit ?? "",
    alertThresholdPct:
      budget?.alertThresholdPct !== undefined
        ? String(budget.alertThresholdPct)
        : "80",
    includeChildren: budget?.includeChildren ?? true,
    rollover: budget?.rollover ?? "NONE",
    recurring: budget?.recurring ?? false,
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
  const { config, formatLocale } = useFinanceEnabled()
  const baseCurrency = config.baseCurrency
  const expenseCategories = useMemo(
    () => filterCategoriesByType(categories, "EXPENSE"),
    [categories]
  )
  const hasCategories = expenseCategories.length > 0
  const createCategory = useCreateCategory()
  const includeChildrenId = useId()
  const recurringId = useId()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: toFormValues({
      budget,
      monthStartDay: config.monthStartDay,
    }),
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })
  const categoryIds = useWatch({ control, name: "categoryIds" })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "category"
  >("none")
  const closeCategoryPicker = closeHandlerFor("category")
  const selectedCategories = useMemo(
    () =>
      categoryIds
        .map((categoryId) =>
          categories.find((category) => category.id === categoryId)
        )
        .filter((category): category is FinanceCategory => Boolean(category)),
    [categories, categoryIds]
  )
  const display = {
    currency: baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const historyRange = useMemo(() => previousMonthsBounds(new Date(), 3), [])
  const historyQuery = useAllTransactions(open && categoryIds.length > 0, {
    type: "DEBIT",
    dateFrom: historyRange.dateFrom,
    dateTo: historyRange.dateTo,
  })
  const averageMonthlySpend = useMemo(() => {
    const selected = new Set(categoryIds)
    const items = (historyQuery.data ?? []).filter(
      (item) => item.categoryId && selected.has(item.categoryId)
    )
    if (items.length === 0) {
      return null
    }
    const { expenses } = visibleTransactionTotals(items)
    return expenses > 0 ? expenses / 3 : null
  }, [historyQuery.data, categoryIds])
  const periodType = useWatch({ control, name: "periodType" })
  const periodStart = useWatch({ control, name: "periodStart" })
  const periodEnd = useWatch({ control, name: "periodEnd" })
  const isCustom = periodType === "CUSTOM"

  useEffect(() => {
    if (open) {
      reset(
        toFormValues({
          budget,
          monthStartDay: config.monthStartDay,
        })
      )
    }
  }, [open, budget, reset, config.monthStartDay])

  useEffect(() => {
    if (!open || budget || periodType === "CUSTOM") {
      return
    }
    const bounds = boundsForPeriod(periodType, {
      monthStartDay: config.monthStartDay,
    })
    setValue("periodStart", bounds.periodStart)
    setValue("periodEnd", bounds.periodEnd)
  }, [open, budget, periodType, setValue, config.monthStartDay])

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

  async function addBudgetCategory(name: string): Promise<void> {
    try {
      const created = await createCategory.mutateAsync({
        name,
        type: "EXPENSE",
      })
      setValue("categoryIds", [...categoryIds, created.id], {
        shouldValidate: true,
      })
      closeCategoryPicker(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={requestOpenChange}>
        <DrawerContent>
          <SheetHeader
            title={isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
            description={
              hasCategories
                ? "El tope es por categorías y periodo. El gasto se calcula con los movimientos."
                : "Crea la categoría desde el selector de categorías."
            }
            pending={pending}
            actions={<SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.budget} />}
          />
          <SheetBody pending={pending}>
            <SummarySection title="Presupuesto" icon={PiggyBankIcon}>
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Categorías
                </FieldLabel>
                <CategoryMultiTrigger
                  categories={selectedCategories}
                  onClick={() => openPicker("category")}
                  onRemove={(categoryId) =>
                    setValue(
                      "categoryIds",
                      removeCategoryId(categoryIds, categoryId),
                      { shouldValidate: true }
                    )
                  }
                />
                {errors.categoryIds?.message ? (
                  <FieldError>{errors.categoryIds.message}</FieldError>
                ) : null}
              </Field>
              <Controller
                control={control}
                name="amountLimit"
                render={({ field }) => (
                  <FinanceMoneyField
                    calculatorKey="budget-amount"
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
                  <Field
                    data-invalid={errors.alertThresholdPct ? true : undefined}
                    className="gap-1"
                  >
                    <FieldLabel>Avisarme al</FieldLabel>
                    <ToggleGroup
                      value={[field.value]}
                      onValueChange={(next) => {
                        if (next.length > 0) {
                          field.onChange(next[0])
                        }
                      }}
                      variant="outline"
                      size="sm"
                      aria-label="Avisarme al"
                    >
                      {THRESHOLD_OPTIONS.map((option) => (
                        <ToggleGroupItem
                          key={option.value}
                          value={option.value}
                          className="rounded-full"
                        >
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    {errors.alertThresholdPct?.message ? (
                      <FieldError>
                        {errors.alertThresholdPct.message}
                      </FieldError>
                    ) : null}
                  </Field>
                )}
              />
            </SummarySection>

            <SummarySection title="Periodo" icon={CalendarIcon}>
              <Controller
                control={control}
                name="periodType"
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Tipo</FieldLabel>
                    <ToggleGroup
                      value={[field.value]}
                      onValueChange={(next) => {
                        if (next.length > 0) {
                          field.onChange(next[0])
                        }
                      }}
                      variant="outline"
                      size="sm"
                      aria-label="Tipo"
                    >
                      {PERIOD_OPTIONS.map((option) => (
                        <ToggleGroupItem
                          key={option.value}
                          value={option.value}
                          className="rounded-full"
                        >
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
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
                  {formatFinanceDateLabel(periodStart, display.locale)} —{" "}
                  {formatFinanceDateLabel(periodEnd, display.locale)}
                </FinanceHelpText>
              )}
            </SummarySection>

            <SummarySection title="Opciones" icon={PiggyBankIcon}>
              <Controller
                control={control}
                name="includeChildren"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                    <FieldLabel htmlFor={includeChildrenId} className="text-sm">
                      Incluir subcategorías
                    </FieldLabel>
                    <Switch
                      id={includeChildrenId}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="recurring"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                    <FieldLabel htmlFor={recurringId} className="text-sm">
                      Repetir cada periodo
                    </FieldLabel>
                    <Switch
                      id={recurringId}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="rollover"
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Arrastre</FieldLabel>
                    <ToggleGroup
                      value={[field.value]}
                      onValueChange={(next) => {
                        if (next.length > 0) {
                          field.onChange(next[0])
                        }
                      }}
                      variant="outline"
                      size="sm"
                      aria-label="Arrastre"
                    >
                      {ROLLOVER_OPTIONS.map((option) => (
                        <ToggleGroupItem
                          key={option.value}
                          value={option.value}
                          className="rounded-full"
                        >
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
                )}
              />
            </SummarySection>
          </SheetBody>
          {!pending ? (
            <DrawerFooter className={SHEET_FOOTER_CLASS}>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => requestOpenChange(false)}
              >
                <XIcon className="size-4 shrink-0" aria-hidden="true" />
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isPending || categoryIds.length === 0}
                className="flex-1"
                onClick={onSubmit}
              >
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Guardar
              </Button>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
        <CategoryPickerSheet
          open={picker === "category"}
          onOpenChange={closeCategoryPicker}
          categories={categories}
          categoryType="EXPENSE"
          multiple
          value={categoryIds}
          onChange={(next) =>
            setValue("categoryIds", next, { shouldValidate: true })
          }
          onCreate={addBudgetCategory}
        />
      </Drawer>

      {discardChangesDialog}
    </>
  )
}
