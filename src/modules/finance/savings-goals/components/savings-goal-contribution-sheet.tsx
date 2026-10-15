"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceHelpText } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCreateSavingsGoalContribution } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateTransfer } from "@/src/modules/finance/shared/hooks/use-transactions"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import { buildCreateTransferBody } from "@/src/modules/finance/shared/lib/ledger-payloads"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { monthlySavingsSuggestion } from "@/src/modules/finance/shared/lib/planning-lists"
import { buildSavingsGoalContributionBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  NotebookPenIcon,
  PiggyBankIcon,
  SparklesIcon,
  TargetIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  savingsGoalContributionSchema,
  type SavingsGoalContributionFormValues,
} from "@/src/modules/finance/savings-goals/lib/savings-goal-contribution-form"

const EMPTY_FORM: SavingsGoalContributionFormValues = {
  amount: "",
  accountId: "",
  kind: "CONTRIBUTION",
  contributedAt: "",
  notes: "",
}

type SavingsGoalContributionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string | null
  goalName?: string
  currency?: string
  targetAmount?: string
  currentAmount?: string
  targetDate?: string | null
  /** Account that holds the goal; a different origin needs a transfer first. */
  goalAccountId?: string | null
  goalMode?: "EARMARK" | "DEDICATED"
  pending?: boolean
}

export function SavingsGoalContributionSheet({
  open,
  onOpenChange,
  goalId,
  goalName,
  currency,
  targetAmount,
  currentAmount,
  targetDate,
  goalAccountId,
  goalMode,
  pending = false,
}: SavingsGoalContributionSheetProps) {
  const createMutation = useCreateSavingsGoalContribution()
  const transferMutation = useCreateTransfer()
  const { config } = useFinanceEnabled()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const goalCurrency = currency ?? config.baseCurrency
  const activeAccounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive && account.currency === goalCurrency
  )
  const institutions = institutionsQuery.data ?? []
  const defaultAccountId = activeAccounts[0]?.id ?? ""
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "account">(
    "none"
  )

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<SavingsGoalContributionFormValues>({
    resolver: zodResolver(savingsGoalContributionSchema),
    defaultValues: EMPTY_FORM,
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_FORM, contributedAt: todayDateInput() })
    }
  }, [open, reset])

  useEffect(() => {
    if (!open || !defaultAccountId || getValues("accountId")) {
      return
    }
    setValue("accountId", defaultAccountId, { shouldValidate: true })
  }, [open, defaultAccountId, getValues, setValue])

  const display = {
    currency: goalCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const target = parseFinanceMoney(targetAmount)
  const saved = parseFinanceMoney(currentAmount)
  const remaining = target !== null && saved !== null ? target - saved : null
  const suggestion = monthlySavingsSuggestion({
    targetAmount,
    currentAmount,
    targetDate,
    now: new Date(),
  })

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!goalId) {
      return
    }
    const payload = buildSavingsGoalContributionBody({
      amount: values.amount,
      kind: values.kind,
      date: values.contributedAt,
      notes: values.notes,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    const needsTransfer =
      values.kind === "CONTRIBUTION" &&
      goalMode === "EARMARK" &&
      Boolean(goalAccountId) &&
      values.accountId !== goalAccountId
    try {
      if (needsTransfer) {
        const transferPayload = buildCreateTransferBody({
          fromAccountId: values.accountId,
          toAccountId: goalAccountId ?? undefined,
          amount: values.amount,
          currency: goalCurrency,
          transactionDate: values.contributedAt,
          description: goalName ? `Aporte a ${goalName}` : "Aporte a meta",
        })
        if (!transferPayload.ok) {
          appToast.error({ text1: transferPayload.error })
          return
        }
        const transfer = await transferMutation.mutateAsync(
          transferPayload.body
        )
        payload.body.fromTransferGroupId = transfer.transferGroupId
      }
      await createMutation.mutateAsync({ goalId, body: payload.body })
      appToast.success({ text1: "Aporte registrado" })
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
              onClick={() => requestOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              type="button"
              disabled={createMutation.isPending || transferMutation.isPending}
              className="flex-1"
              onClick={onSubmit}
            >
              {createMutation.isPending || transferMutation.isPending ? (
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
              <FinanceMoneyField
                label="Monto"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("amount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.amount?.message}
                currency={goalCurrency}
              />
            )}
          />
          {remaining !== null && remaining > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestion ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue(
                      "amount",
                      String(Math.round(suggestion.monthlyAmount)),
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                >
                  <SparklesIcon className="size-4 shrink-0" />
                  {`Sugerido ${formatFinanceMoney(suggestion.monthlyAmount, display)}`}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue("amount", String(Math.round(remaining)), {
                    shouldValidate: true,
                  })
                }
              >
                <TargetIcon className="size-4 shrink-0" />
                {`Lo que falta ${formatFinanceMoney(remaining, display)}`}
              </Button>
            </div>
          ) : null}
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Cuenta de origen
                </FieldLabel>
                <DestinationTrigger
                  destination={
                    field.value
                      ? encodeLedgerTarget("account", field.value)
                      : CATALOG_NONE
                  }
                  accounts={activeAccounts}
                  cards={[]}
                  display={display}
                  placeholder="Elige la cuenta"
                  onClick={() => openPicker("account")}
                />
                {errors.accountId?.message ? (
                  <FieldError>{errors.accountId.message}</FieldError>
                ) : null}
              </Field>
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
            El aporte aparta dinero de la cuenta, no lo gasta. Si eliges otra
            cuenta, primero se mueve con una transferencia.
          </FinanceHelpText>
        </SummarySection>
      </BottomSheet>

      {discardChangesDialog}

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
        accounts={activeAccounts}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(next) =>
          setValue("accountId", splitLedgerTarget(next).accountId ?? "", {
            shouldValidate: true,
          })
        }
      />
    </>
  )
}
