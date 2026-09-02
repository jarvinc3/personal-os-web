"use client"

import {
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from "@/src/modules/finance/hooks/use-budgets"
import {
  boundsForPeriod,
  buildCreateBudgetBody,
} from "@/src/modules/finance/lib/budget-payloads"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type {
  FinanceBudget,
  FinanceBudgetPeriod,
  FinanceCategory,
} from "@/src/modules/finance/types/entities"
import {
  FINANCE_BUDGET_PERIOD_LABEL,
  FINANCE_BUDGET_PERIODS,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PiggyBankIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  categoryId: z.string().min(1, "Elige una categoría"),
  periodType: z.enum(FINANCE_BUDGET_PERIODS),
  periodStart: z.string().trim().min(1, "Inicio obligatorio"),
  periodEnd: z.string().trim().min(1, "Fin obligatorio"),
  amountLimit: z.string().trim().min(1, "Tope obligatorio"),
  alertThresholdPct: z.string().trim().min(1, "Umbral obligatorio"),
})

type FormValues = z.infer<typeof schema>

const PERIOD_OPTIONS = FINANCE_BUDGET_PERIODS.map((value) => ({
  value,
  label: FINANCE_BUDGET_PERIOD_LABEL[value],
}))

function toFormValues(
  budget: FinanceBudget | null,
  defaultCategoryId: string,
): FormValues {
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
}

export function BudgetSheet({
  open,
  onOpenChange,
  budget,
  categories,
}: BudgetSheetProps) {
  const isEdit = Boolean(budget)
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const deleteMutation = useDeleteBudget()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending
  const hasCategories = categories.length > 0
  const defaultCategoryId = categories[0]?.id ?? ""

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
      })),
    [categories],
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(budget, defaultCategoryId),
  })

  const periodType = useWatch({ control, name: "periodType" })

  useEffect(() => {
    if (open) {
      reset(toFormValues(budget, defaultCategoryId))
    }
  }, [open, budget, defaultCategoryId, reset])

  useEffect(() => {
    if (!open || budget || periodType === "CUSTOM") return
    const bounds = boundsForPeriod(periodType)
    setValue("periodStart", bounds.periodStart)
    setValue("periodEnd", bounds.periodEnd)
  }, [open, budget, periodType, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
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
    if (!budget) return
    const confirmed = window.confirm(
      "¿Eliminar este presupuesto? No se puede deshacer.",
    )
    if (!confirmed) return
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
            <FormTextField
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
            <SelectField
              label="Tipo"
              value={field.value}
              onChange={(value) =>
                field.onChange(value as FinanceBudgetPeriod)
              }
              options={PERIOD_OPTIONS}
            />
          )}
        />
        <Controller
          control={control}
          name="periodStart"
          render={({ field }) => (
            <FormTextField
              label="Desde"
              type="date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="periodEnd"
          render={({ field }) => (
            <FormTextField
              label="Hasta"
              type="date"
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
