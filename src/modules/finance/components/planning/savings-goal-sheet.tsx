"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import {
  useCreateSavingsGoal,
  useDeleteSavingsGoal,
  useUpdateSavingsGoal,
} from "@/src/modules/finance/hooks/use-savings-goals"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { formatPlanningDate } from "@/src/modules/finance/lib/planning-lists"
import { buildCreateSavingsGoalBody } from "@/src/modules/finance/lib/planning-payloads"
import type { FinanceSavingsGoal } from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PiggyBankIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  description: z.string().max(500),
  targetAmount: z.string().trim().min(1, "Meta obligatoria"),
  currentAmount: z.string(),
  currency: z.string().trim().min(3).max(3),
  targetDate: z.string(),
})

type FormValues = z.infer<typeof schema>

function toFormValues(
  goal: FinanceSavingsGoal | null,
  defaultCurrency: string
): FormValues {
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
    const payload = buildCreateSavingsGoalBody(values)
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
    if (!goal) return
    const confirmed = window.confirm("¿Eliminar esta meta de ahorro?")
    if (!confirmed) return
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
          <p className="text-sm text-muted-foreground">
            {goal.isCompleted ? "Completada" : "En curso"}
            {goal.isCompleted && goal.completedAt
              ? ` · ${formatPlanningDate(goal.completedAt)}`
              : ""}
          </p>
        ) : null}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextField
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
          name="description"
          render={({ field }) => (
            <FormTextField
              label="Descripción"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.description?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="targetAmount"
          render={({ field }) => (
            <FormTextField
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
              label="Ahorrado"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.currentAmount?.message}
              placeholder="0"
            />
          )}
        />
        <Controller
          control={control}
          name="targetDate"
          render={({ field }) => (
            <FormTextField
              label="Fecha objetivo"
              type="date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
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
    </BottomSheet>
  )
}
