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
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { monthlySavingsSuggestion } from "@/src/modules/finance/shared/lib/planning-lists"
import { buildSavingsGoalContributionBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { defaultContributionAccountId } from "@/src/modules/finance/savings-goals/lib/contribution-account"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BanknoteIcon,
  CircleAlertIcon,
  NotebookPenIcon,
  PiggyBankIcon,
  SaveIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  savingsGoalContributionSchema,
  type SavingsGoalContributionFormValues,
} from "@/src/modules/finance/savings-goals/lib/savings-goal-contribution-form"

export type SavingsGoalAllocationMode = "CONTRIBUTION" | "WITHDRAWAL"

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
  /** Account that holds the goal; it is the default origin of the money. */
  goalAccountId?: string | null
  mode?: SavingsGoalAllocationMode
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
  mode = "CONTRIBUTION",
  pending = false,
}: SavingsGoalContributionSheetProps) {
  const createMutation = useCreateSavingsGoalContribution()
  const { config, formatLocale } = useFinanceEnabled()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const goalCurrency = currency ?? config.baseCurrency
  const activeAccounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive && account.currency === goalCurrency
  )
  const institutions = institutionsQuery.data ?? []
  const isWithdrawal = mode === "WITHDRAWAL"
  const defaultAccountId = isWithdrawal
    ? (activeAccounts.find((account) => account.id !== goalAccountId)?.id ??
      activeAccounts[0]?.id ??
      "")
    : defaultContributionAccountId({
        accounts: activeAccounts,
        goalAccountId: goalAccountId ?? null,
      })
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
      reset({
        ...EMPTY_FORM,
        kind: mode,
        contributedAt: todayDateInput(),
      })
    }
  }, [open, mode, reset])

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
    locale: formatLocale,
  }
  const target = parseFinanceMoney(targetAmount)
  const saved = parseFinanceMoney(currentAmount)
  const remaining = target !== null && saved !== null ? target - saved : null
  const typedAmount = useWatch({ control, name: "amount" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const typedAmountValue = parseFinanceMoney(typedAmount)
  const originAccount =
    activeAccounts.find((account) => account.id === selectedAccountId) ?? null
  const originFreeBalance =
    !isWithdrawal && originAccount
      ? parseFinanceMoney(originAccount.freeBalance)
      : null
  const exceedsFreeBalance =
    originFreeBalance !== null &&
    typedAmountValue !== null &&
    typedAmountValue > originFreeBalance
  const withdrawalExceeds =
    isWithdrawal && typedAmountValue !== null && saved !== null
      ? typedAmountValue > saved
      : false
  const projectedAmount =
    saved !== null ? saved + (typedAmountValue ?? 0) : null
  const surplusAfterContribution =
    !isWithdrawal &&
    target !== null &&
    projectedAmount !== null &&
    projectedAmount > target
      ? projectedAmount - target
      : null
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
    if (withdrawalExceeds) {
      appToast.error({ text1: "El retiro supera lo disponible" })
      return
    }
    const payload = buildSavingsGoalContributionBody({
      amount: values.amount,
      kind: values.kind,
      date: values.contributedAt,
      notes: values.notes,
      ...(isWithdrawal
        ? { toAccountId: values.accountId }
        : { fromAccountId: values.accountId }),
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await createMutation.mutateAsync({ goalId, body: payload.body })
      appToast.success({
        text1: isWithdrawal ? "Retiro registrado" : "Aporte registrado",
      })
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
        helpAction={
          <SheetHelpAction
            sheetKey={
              isWithdrawal
                ? FINANCE_SHEET_KEYS.savingsWithdrawal
                : FINANCE_SHEET_KEYS.savingsContribution
            }
          />
        }
        pending={pending}
        title={isWithdrawal ? "Retirar dinero" : "Registrar aporte"}
        description={
          isWithdrawal
            ? goalName
              ? `El dinero sale de la cuenta de ${goalName}.`
              : "El dinero sale de la cuenta de la meta."
            : goalName
              ? `Se suma al avance de ${goalName}.`
              : "Se suma al avance de la meta."
        }
        actions={{
          submit: (
            <Button
              type="button"
              disabled={createMutation.isPending || exceedsFreeBalance}
              className="flex-1"
              onClick={onSubmit}
            >
              {createMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : isWithdrawal ? (
                <BanknoteIcon className="size-4 shrink-0" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              {isWithdrawal ? "Retirar" : "Registrar"}
            </Button>
          ),
        }}
      >
        <SummarySection
          title={isWithdrawal ? "Retiro" : "Aporte"}
          icon={PiggyBankIcon}
        >
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <FinanceMoneyField
                calculatorKey="savings-contribution-amount"
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
          {originFreeBalance !== null ? (
            <p className="text-xs text-muted-foreground">
              {`Saldo libre en ${originAccount?.name ?? "la cuenta"}: ${formatFinanceMoney(originFreeBalance, display)}`}
            </p>
          ) : null}
          {exceedsFreeBalance ? (
            <p className="flex items-start gap-1.5 text-xs text-destructive">
              <CircleAlertIcon className="mt-px size-3.5 shrink-0" />
              El monto supera el saldo libre de esa cuenta. Baja el monto o
              elige otra cuenta de origen.
            </p>
          ) : null}
          {withdrawalExceeds ? (
            <p className="flex items-start gap-1.5 text-xs text-destructive">
              <CircleAlertIcon className="mt-px size-3.5 shrink-0" />
              Solo puedes retirar hasta{" "}
              {formatFinanceMoney(currentAmount ?? "0", display)}.
            </p>
          ) : null}
          {surplusAfterContribution !== null ? (
            <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
              <CircleAlertIcon className="mt-px size-3.5 shrink-0" />
              Este aporte deja{" "}
              {formatFinanceMoney(surplusAfterContribution, display)} por encima
              de la meta.
            </p>
          ) : null}
          {isWithdrawal ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue("amount", currentAmount ?? "0", {
                    shouldValidate: true,
                  })
                }
              >
                <TargetIcon className="size-4 shrink-0" />
                {`Todo ${formatFinanceMoney(currentAmount ?? "0", display)}`}
              </Button>
            </div>
          ) : remaining !== null && remaining > 0 ? (
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
                  {isWithdrawal ? "Cuenta de destino" : "Cuenta de origen"}
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
                  placeholder={
                    isWithdrawal
                      ? "Elige la cuenta que recibe"
                      : "Elige la cuenta"
                  }
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
            {isWithdrawal
              ? "El retiro mueve el dinero a la cuenta elegida. No cuenta como ingreso ni gasto."
              : "El origen es la cuenta de donde sale el dinero; la cuenta de la meta es donde queda apartado, y el aporte no lo gasta: sigue en su saldo."}
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
