"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceAmountField,
  FinanceHelpText,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { useCreateSavingsGoalContribution } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { buildSavingsGoalContributionBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { NotebookPenIcon, PiggyBankIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  savingsGoalContributionSchema,
  type SavingsGoalContributionFormValues,
} from "@/src/modules/finance/planning/lib/savings-goal-contribution-form"

const EMPTY_FORM: SavingsGoalContributionFormValues = {
  amount: "",
  contributedAt: "",
  notes: "",
}

type SavingsGoalContributionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string | null
  goalName?: string
  pending?: boolean
}

export function SavingsGoalContributionSheet({
  open,
  onOpenChange,
  goalId,
  goalName,
  pending = false,
}: SavingsGoalContributionSheetProps) {
  const createMutation = useCreateSavingsGoalContribution()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavingsGoalContributionFormValues>({
    resolver: zodResolver(savingsGoalContributionSchema),
    defaultValues: EMPTY_FORM,
  })

  useEffect(() => {
    if (open) {
      reset(EMPTY_FORM)
    }
  }, [open, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!goalId) {
      return
    }
    const payload = buildSavingsGoalContributionBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await createMutation.mutateAsync({ goalId, body: payload.body })
      appToast.success({ text1: "Aporte registrado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title="Registrar aporte"
      description={
        goalName
          ? `Se suma al avance de ${goalName}.`
          : "Se suma al avance de la meta."
      }
      actions={{
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
            disabled={createMutation.isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {createMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Registrar
          </Button>
        ),
      }}
    >
      <SummarySection title="Aporte" icon={PiggyBankIcon}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FinanceAmountField
              label="Monto"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.amount?.message}
              placeholder="5000"
            />
          )}
        />
        <Controller
          control={control}
          name="contributedAt"
          render={({ field }) => (
            <FinanceDateField
              label="Fecha"
              value={field.value}
              onChange={field.onChange}
              optional
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextField
              icon={NotebookPenIcon}
              label="Nota"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.notes?.message}
            />
          )}
        />
        <FinanceHelpText>
          El aporte no mueve dinero entre cuentas: solo avanza la meta.
        </FinanceHelpText>
      </SummarySection>
    </BottomSheet>
  )
}
