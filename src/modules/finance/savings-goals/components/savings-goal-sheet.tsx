"use client"

import { FinanceCurrencyPills } from "@/src/modules/finance/shared/components/forms/currency-pills"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceAmountField,
  FinanceDetailsDisclosure,
  FinanceHelpText,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  useCreateSavingsGoal,
  useDeleteSavingsGoal,
  useUpdateSavingsGoal,
} from "@/src/modules/finance/shared/hooks/use-savings-goals"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatPlanningDate } from "@/src/modules/finance/shared/lib/planning-lists"
import { buildSavingsGoalBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  NotebookPenIcon,
  PiggyBankIcon,
  TargetIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  savingsGoalSchema,
  type SavingsGoalFormValues,
} from "@/src/modules/finance/planning/lib/savings-goal-form"

function toFormValues(
  goal: FinanceSavingsGoal | null,
  defaultCurrency: string
): SavingsGoalFormValues {
  return {
    name: goal?.name ?? "",
    description: goal?.description ?? "",
    targetAmount: goal?.targetAmount ?? "",
    currentAmount: goal?.currentAmount ?? "",
    currency: goal?.currency ?? defaultCurrency,
    targetDate: formatPlanningDate(goal?.targetDate),
  }
}

type SavingsGoalSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: FinanceSavingsGoal | null
  defaultCurrency: string
  pending?: boolean
}

export function SavingsGoalSheet({
  open,
  onOpenChange,
  goal,
  defaultCurrency,
  pending = false,
}: SavingsGoalSheetProps) {
  const isEdit = Boolean(goal)
  const createMutation = useCreateSavingsGoal()
  const updateMutation = useUpdateSavingsGoal()
  const deleteMutation = useDeleteSavingsGoal()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: toFormValues(goal, defaultCurrency),
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(goal, defaultCurrency))
    }
  }, [open, goal, defaultCurrency, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildSavingsGoalBody(values, { isUpdate: isEdit })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (goal) {
        await updateMutation.mutateAsync({ id: goal.id, body: payload.body })
        appToast.success({ text1: "Meta actualizada" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Meta creada" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onDelete() {
    if (!goal) {
      return
    }
    const confirmed = window.confirm("¿Eliminar esta meta de ahorro?")
    if (!confirmed) {
      return
    }
    try {
      await deleteMutation.mutateAsync(goal.id)
      appToast.success({ text1: "Meta eliminada" })
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
      title={isEdit ? "Editar meta" : "Nueva meta"}
      description="El estado Completada lo marca el API cuando lo ahorrado alcanza la meta."
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
            disabled={isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Ahorro" icon={PiggyBankIcon}>
        {goal ? (
          <FinanceHelpText>
            {goal.isCompleted ? "Completada" : "En curso"}
            {goal.isCompleted && goal.completedAt
              ? ` · ${formatPlanningDate(goal.completedAt)}`
              : ""}
          </FinanceHelpText>
        ) : null}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextField
              icon={TargetIcon}
              label="Nombre"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
              placeholder="Fondo de emergencia"
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
              extraCodes={[defaultCurrency, goal?.currency ?? ""]}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Progreso" icon={TargetIcon}>
        <Controller
          control={control}
          name="targetAmount"
          render={({ field }) => (
            <FinanceAmountField
              label="Meta"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.targetAmount?.message}
              placeholder="50000"
            />
          )}
        />
        <Controller
          control={control}
          name="currentAmount"
          render={({ field }) => (
            <FormTextField
              icon={PiggyBankIcon}
              label="Ahorrado"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.currentAmount?.message}
              placeholder="0"
              disabled={isEdit}
            />
          )}
        />
        <Controller
          control={control}
          name="targetDate"
          render={({ field }) => (
            <FinanceDateField
              label="Fecha objetivo"
              value={field.value}
              onChange={field.onChange}
              optional
            />
          )}
        />
      </SummarySection>

      <FinanceDetailsDisclosure>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormTextField
              icon={NotebookPenIcon}
              label="Descripción"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.description?.message}
            />
          )}
        />
      </FinanceDetailsDisclosure>
    </BottomSheet>
  )
}
