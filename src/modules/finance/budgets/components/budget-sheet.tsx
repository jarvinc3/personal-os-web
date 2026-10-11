"use client"

import {
  FinanceDateField,
  formatFinanceDateLabel,
} from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceAmountField,
  FinanceHelpText,
  FinanceSegmentedControl,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from "@/src/modules/finance/shared/hooks/use-budgets"
import {
  boundsForPeriod,
  buildCreateBudgetBody,
} from "@/src/modules/finance/shared/lib/budget-payloads"
import { filterCategoriesByType } from "@/src/modules/finance/shared/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
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
import {
  BellIcon,
  CalendarIcon,
  PiggyBankIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
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
  const deleteMutation = useDeleteBudget()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending
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

  const categoryOptions = useMemo(
    () =>
      expenseCategories.map((category) => ({
        value: category.id,
        label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
      })),
    [expenseCategories]
  )

  const { control, handleSubmit, reset, setValue } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: toFormValues(budget, defaultCategoryId),
  })

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

  async function onDelete() {
    if (!budget) {
      return
    }
    const confirmed = window.confirm(
      "¿Eliminar este presupuesto? No se puede deshacer."
    )
    if (!confirmed) {
      return
    }
    try {
      await deleteMutation.mutateAsync(budget.id)
      appToast.success({ text1: "Presupuesto eliminado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}
      description={
        hasCategories
          ? "El tope es por categoría y periodo. El gasto se calcula con los movimientos."
          : "Crea una categoría antes de agregar un presupuesto."
      }
      actions={{
        delete: isEdit ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onDelete()}
          >
            <Trash2Icon className="size-4 shrink-0" />
            Eliminar
          </Button>
        ) : undefined,
        close: (
          <Button
            type="button"
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
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <SelectField
              icon={TagIcon}
              label="Categoría"
              value={field.value}
              onChange={field.onChange}
              options={
                hasCategories
                  ? categoryOptions
                  : [{ value: "", label: "Crea una categoría primero" }]
              }
              disabled={!hasCategories}
            />
          )}
        />
        <Controller
          control={control}
          name="amountLimit"
          render={({ field }) => (
            <FinanceAmountField
              label="Tope"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="1000"
            />
          )}
        />
        <Controller
          control={control}
          name="alertThresholdPct"
          render={({ field }) => (
            <FormTextField
              icon={BellIcon}
              label="Umbral de alerta (%)"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="80"
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
              onChange={(value) => field.onChange(value as FinanceBudgetPeriod)}
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
  )
}
