"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceDetailsDisclosure,
  FinanceHelpText,
  FinanceSuggestionRow,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
} from "@/src/modules/finance/shared/hooks/use-savings-goals"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  formatPlanningDate,
  monthlySavingsSuggestion,
} from "@/src/modules/finance/shared/lib/planning-lists"
import { buildSavingsGoalBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import { NotebookPenIcon, PiggyBankIcon, TargetIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  savingsGoalSchema,
  type SavingsGoalFormValues,
} from "@/src/modules/finance/savings-goals/lib/savings-goal-form"

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
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: toFormValues(goal, defaultCurrency),
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })
  const currency = useWatch({ control, name: "currency" })
  const targetAmount = useWatch({ control, name: "targetAmount" })
  const currentAmount = useWatch({ control, name: "currentAmount" })
  const targetDate = useWatch({ control, name: "targetDate" })
  const { config } = useFinanceEnabled()
  const display = {
    currency: currency || defaultCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const suggestion = monthlySavingsSuggestion({
    targetAmount,
    currentAmount,
    targetDate,
    now: new Date(),
  })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "currency"
  >("none")

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

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        pending={pending}
        title={isEdit ? "Editar meta" : "Nueva meta"}
        description="Se marca como completada cuando lo ahorrado alcanza la meta."
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
        </SummarySection>

        <SummarySection title="Progreso" icon={TargetIcon}>
          <Controller
            control={control}
            name="targetAmount"
            render={({ field }) => (
              <FinanceMoneyField
                label="Meta"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("targetAmount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.targetAmount?.message}
                currency={currency || defaultCurrency}
                onCurrencyPress={() => openPicker("currency")}
              />
            )}
          />
          <Controller
            control={control}
            name="currentAmount"
            render={({ field }) => (
              <FinanceMoneyField
                label="Ahorrado"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("currentAmount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.currentAmount?.message}
                currency={currency || defaultCurrency}
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
          {suggestion ? (
            <FinanceSuggestionRow>
              {`${formatFinanceMoney(suggestion.monthlyAmount, display)} / mes · ${suggestion.months} meses · ${Math.round(suggestion.coveredPct)}% cubierto`}
            </FinanceSuggestionRow>
          ) : null}
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

      {discardChangesDialog}

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={(next) =>
          setValue("currency", next, { shouldValidate: true })
        }
      />
    </>
  )
}
