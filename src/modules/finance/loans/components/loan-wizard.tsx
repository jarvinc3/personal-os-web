"use client"

import { format } from "date-fns"
import {
  ArrowDownCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  CircleAlert,
  HashIcon,
  InfoIcon,
  LandmarkIcon,
  NotebookPenIcon,
  PercentIcon,
  SaveIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceHelpText,
  FinanceSegmentedControl,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateLoan } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { buildLoanBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type { FinanceInstallmentFreq } from "@/src/modules/finance/shared/types/entities"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_INSTALLMENT_FREQS,
} from "@/src/modules/finance/shared/types/entities"
import {
  LOAN_WIZARD_TERMS,
  loanWizardSchema,
  type LoanWizardValues,
} from "@/src/modules/finance/loans/lib/loan-form"
import {
  computeLoanPlan,
  roundToCents,
  type LoanPlan,
} from "@/src/modules/finance/loans/lib/loan-wizard"
import {
  FormTextField,
  OptionRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"

type WizardStep = "who" | "institution" | "details" | "calculating" | "review"

const STEP_ORDER: WizardStep[] = [
  "who",
  "institution",
  "details",
  "calculating",
  "review",
]

const TERM_OPTIONS = LOAN_WIZARD_TERMS.map((term) => ({
  value: String(term),
  label: `${term}m`,
}))

const FREQ_OPTIONS = FINANCE_INSTALLMENT_FREQS.map((value) => ({
  value,
  label: FINANCE_INSTALLMENT_FREQ_LABEL[value],
}))

const KNOWN_OPTIONS = [
  { value: "RATE", label: "Tasa" },
  { value: "INSTALLMENT", label: "Cuota" },
]

const CALCULATING_STEPS = [
  "Cuota mensual",
  "Cuotas pagadas",
  "Saldo pendiente",
  "Calendario",
]

function wizardDefaults(
  defaultCurrency: string,
  defaultInstitutionId: string,
  prefill: Partial<LoanWizardValues>
): LoanWizardValues {
  return {
    who: "BANK",
    lenderName: "",
    institutionId: defaultInstitutionId,
    amount: "",
    currency: defaultCurrency,
    freq: "MONTHLY",
    periods: "36",
    known: "RATE",
    ratePercent: "",
    installment: "",
    accountId: CATALOG_NONE,
    disbursementDate: todayDateInput(),
    rateType: "FIXED",
    insuranceAmount: "",
    notes: "",
    ...prefill,
  }
}

type LoanWizardProps = {
  defaultCurrency: string
  defaultInstitutionId?: string
  prefill?: Partial<LoanWizardValues>
  display: FinanceMoneyDisplay
  onDone: () => void
}

export function LoanWizard({
  defaultCurrency,
  defaultInstitutionId = CATALOG_NONE,
  prefill = {},
  display,
  onDone,
}: LoanWizardProps) {
  const createMutation = useCreateLoan()
  const accountsQuery = useAccounts(true)
  const institutionsQuery = useInstitutions(true)
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const institutions = useMemo(
    () => institutionsQuery.data ?? [],
    [institutionsQuery.data]
  )
  const [step, setStep] = useState<WizardStep>("who")
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution" | "account" | "currency"
  >("none")

  const {
    control,
    getValues,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LoanWizardValues>({
    mode: "onTouched",
    resolver: zodResolver(loanWizardSchema),
    defaultValues: wizardDefaults(
      defaultCurrency,
      defaultInstitutionId,
      prefill
    ),
  })

  const values = useWatch({ control }) as LoanWizardValues
  const who = values?.who ?? "BANK"
  const currency = values?.currency ?? defaultCurrency
  const known = values?.known ?? "RATE"
  const selectedInstitution =
    institutions.find((item) => item.id === values?.institutionId) ?? null

  useEffect(() => {
    if (!institutionsQuery.isSuccess) {
      return
    }
    const current = getValues("institutionId")
    if (current !== CATALOG_NONE) {
      return
    }
    const first = institutions[0]?.id
    if (first) {
      setValue("institutionId", first, { shouldValidate: true })
    }
  }, [institutions, institutionsQuery.isSuccess, getValues, setValue])

  useEffect(() => {
    if (!accountsQuery.isSuccess) {
      return
    }
    if (getValues("accountId") !== CATALOG_NONE) {
      return
    }
    const first = accounts.find((account) => account.isActive)?.id
    if (first) {
      setValue("accountId", first, { shouldValidate: true })
    }
  }, [accounts, accountsQuery.isSuccess, getValues, setValue])

  useEffect(() => {
    if (step !== "calculating") {
      return
    }
    const timer = setTimeout(() => setStep("review"), 700)
    return () => clearTimeout(timer)
  }, [step])

  const plan = useMemo((): LoanPlan | null => {
    const principal = parseFinanceMoney(values?.amount ?? "")
    const periods = Number(values?.periods ?? "0")
    if (principal === null || principal <= 0 || periods < 1) {
      return null
    }
    const disbursementDate = values?.disbursementDate
      ? new Date(`${values.disbursementDate}T12:00:00`)
      : new Date()
    const freq: FinanceInstallmentFreq = values?.freq ?? "MONTHLY"
    if (known === "INSTALLMENT") {
      const installmentAmount = parseFinanceMoney(values?.installment ?? "")
      if (installmentAmount === null || installmentAmount <= 0) {
        return null
      }
      return computeLoanPlan({
        principal,
        periods,
        freq,
        disbursementDate,
        now: new Date(),
        known: "INSTALLMENT",
        installmentAmount,
      })
    }
    const annualRatePercent =
      values?.ratePercent?.trim() === "" ? 0 : Number(values?.ratePercent)
    if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
      return null
    }
    return computeLoanPlan({
      principal,
      periods,
      freq,
      disbursementDate,
      now: new Date(),
      known: "RATE",
      annualRatePercent,
    })
  }, [values, known])

  const detailsReady = plan !== null
  const whoReady =
    who === "PERSON" ? (values?.lenderName ?? "").trim().length > 0 : true
  const institutionReady =
    who === "PERSON" || (values?.institutionId ?? CATALOG_NONE) !== CATALOG_NONE

  const continueDisabled =
    (step === "who" && !whoReady) ||
    (step === "institution" && !institutionReady) ||
    (step === "details" && !detailsReady) ||
    step === "calculating"

  const onSubmit = handleSubmit(async (formValues) => {
    const currentPlan = plan
    if (!currentPlan) {
      appToast.error({ text1: "Revisa el monto y el plazo" })
      return
    }
    const lenderName =
      formValues.who === "BANK"
        ? (selectedInstitution?.name ?? "")
        : formValues.lenderName.trim()
    const payload = buildLoanBody({
      lenderName,
      originalAmount: formValues.amount,
      currentBalance: String(currentPlan.outstandingBalance),
      installmentAmount: String(currentPlan.installmentAmount),
      installmentFreq: formValues.freq,
      totalInstallments: formValues.periods,
      paidInstallments: String(currentPlan.paidPeriods),
      nextDueDate: format(currentPlan.nextDueDate, "yyyy-MM-dd"),
      institutionId:
        formValues.who === "BANK" ? formValues.institutionId : CATALOG_NONE,
      accountId: formValues.accountId,
      currency: formValues.currency,
      interestRatePercent: String(roundToCents(currentPlan.annualRate * 100)),
      rateType: formValues.rateType,
      insuranceAmount: formValues.insuranceAmount,
      disbursementDate: formValues.disbursementDate,
      notes: formValues.notes,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await createMutation.mutateAsync(payload.body)
      appToast.success({ text1: "Préstamo creado" })
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  function goNext() {
    if (step === "who") {
      setStep(who === "PERSON" ? "details" : "institution")
      return
    }
    if (step === "institution") {
      setStep("details")
      return
    }
    if (step === "details") {
      void trigger()
      setStep("calculating")
    }
  }

  function goBack() {
    if (step === "institution") {
      setStep("who")
      return
    }
    if (step === "details") {
      setStep(who === "PERSON" ? "who" : "institution")
      return
    }
    if (step === "review") {
      setStep("details")
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  return (
    <>
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex items-center gap-2">
          {step !== "who" && step !== "calculating" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Atrás"
              className="size-9 shrink-0 rounded-full"
              onClick={goBack}
            >
              <ArrowLeftIcon className="size-4.5" />
            </Button>
          ) : null}
          <div className="flex flex-1 gap-1">
            {STEP_ORDER.map((item, index) => (
              <span
                key={item}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  index <= stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {step === "who" ? (
          <SummarySection
            title="¿Con quién es el préstamo?"
            icon={LandmarkIcon}
          >
            <OptionRow
              label="Un banco o financiera"
              description="Usa tus instituciones"
              icon={LandmarkIcon}
              selected={who === "BANK"}
              onPress={() => setValue("who", "BANK", { shouldValidate: true })}
            />
            <OptionRow
              label="Una persona"
              description="Familiar o amigo"
              icon={UserIcon}
              selected={who === "PERSON"}
              onPress={() =>
                setValue("who", "PERSON", { shouldValidate: true })
              }
            />
            {who === "PERSON" ? (
              <Controller
                control={control}
                name="lenderName"
                render={({ field }) => (
                  <FormTextField
                    icon={UserIcon}
                    label="Prestamista"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.lenderName?.message}
                    placeholder="Juan Pérez"
                  />
                )}
              />
            ) : null}
          </SummarySection>
        ) : null}

        {step === "institution" ? (
          <SummarySection title="Institución" icon={LandmarkIcon}>
            <Field className="gap-1">
              <FieldLabel className="text-sm text-muted-foreground">
                Banco o financiera
              </FieldLabel>
              <InstitutionTrigger
                institution={selectedInstitution}
                placeholder="Elige la institución"
                onClick={() => openPicker("institution")}
              />
              {errors.institutionId?.message ? (
                <FieldError>{errors.institutionId.message}</FieldError>
              ) : null}
            </Field>
            <FinanceHelpText>
              El nombre del prestamista se toma del banco.
            </FinanceHelpText>
          </SummarySection>
        ) : null}

        {step === "details" ? (
          <>
            <SummarySection title="Importe" icon={WalletIcon}>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <FinanceMoneyField
                    label="¿Cuánto te prestaron?"
                    amount={field.value}
                    onAmountChange={field.onChange}
                    onAmountCommit={(next) => {
                      field.onChange(next)
                      void trigger("amount")
                    }}
                    onAmountBlur={field.onBlur}
                    amountError={errors.amount?.message}
                    currency={currency}
                    onCurrencyPress={() => openPicker("currency")}
                  />
                )}
              />
              <Controller
                control={control}
                name="freq"
                render={({ field }) => (
                  <FinanceSegmentedControl
                    label="Frecuencia"
                    value={field.value}
                    onChange={(value) =>
                      field.onChange(value as FinanceInstallmentFreq)
                    }
                    options={FREQ_OPTIONS}
                  />
                )}
              />
              <Controller
                control={control}
                name="periods"
                render={({ field }) => (
                  <FinanceSegmentedControl
                    label="Plazo"
                    value={field.value}
                    onChange={field.onChange}
                    options={TERM_OPTIONS}
                  />
                )}
              />
              <Controller
                control={control}
                name="known"
                render={({ field }) => (
                  <FinanceSegmentedControl
                    label="Conoces"
                    value={field.value}
                    onChange={field.onChange}
                    options={KNOWN_OPTIONS}
                  />
                )}
              />
              {known === "RATE" ? (
                <Controller
                  control={control}
                  name="ratePercent"
                  render={({ field }) => (
                    <FormTextField
                      icon={PercentIcon}
                      label="Tasa anual (%)"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.ratePercent?.message}
                      placeholder="14.5"
                    />
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  name="installment"
                  render={({ field }) => (
                    <FinanceMoneyField
                      label="Cuota"
                      amount={field.value}
                      onAmountChange={field.onChange}
                      onAmountCommit={(next) => {
                        field.onChange(next)
                        void trigger("installment")
                      }}
                      onAmountBlur={field.onBlur}
                      amountError={errors.installment?.message}
                      currency={currency}
                    />
                  )}
                />
              )}
            </SummarySection>

            <SummarySection title="Ruta" icon={LandmarkIcon}>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel className="text-sm text-muted-foreground">
                      Se paga desde (opcional)
                    </FieldLabel>
                    <DestinationTrigger
                      destination={
                        field.value && field.value !== CATALOG_NONE
                          ? encodeLedgerTarget("account", field.value)
                          : CATALOG_NONE
                      }
                      accounts={accounts.filter((account) => account.isActive)}
                      cards={[]}
                      display={display}
                      placeholder="Sin cuenta de pago"
                      onClick={() => openPicker("account")}
                    />
                  </Field>
                )}
              />
            </SummarySection>

            <SummarySection title="Calendario" icon={CalendarIcon}>
              <Controller
                control={control}
                name="disbursementDate"
                render={({ field }) => (
                  <FinanceDateField
                    label="Desembolso"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.disbursementDate?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="rateType"
                render={({ field }) => (
                  <FinanceSegmentedControl
                    label="Tipo de tasa"
                    value={field.value}
                    onChange={(value) =>
                      field.onChange(value as "FIXED" | "VARIABLE")
                    }
                    options={[
                      { value: "FIXED", label: "Fija" },
                      { value: "VARIABLE", label: "Variable" },
                    ]}
                  />
                )}
              />
              <Controller
                control={control}
                name="insuranceAmount"
                render={({ field }) => (
                  <FinanceMoneyField
                    label="Seguro mensual (opcional)"
                    amount={field.value}
                    onAmountChange={field.onChange}
                    onAmountCommit={(next) => field.onChange(next)}
                    onAmountBlur={field.onBlur}
                    amountError={errors.insuranceAmount?.message}
                    currency={currency}
                  />
                )}
              />
            </SummarySection>
          </>
        ) : null}

        {step === "calculating" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-muted border-t-primary motion-safe:animate-spin" />
            <p className="text-lg font-medium">Calculando...</p>
            <ul className="flex flex-col gap-2">
              {CALCULATING_STEPS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckIcon className="size-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === "review" && plan ? (
          <>
            <SummarySection title="Revisa" icon={SparklesIcon}>
              <SummaryItem
                title="Pendiente"
                icon={WalletIcon}
                value={formatFinanceMoney(String(plan.outstandingBalance), {
                  ...display,
                  currency,
                })}
                isLast={false}
              />
              <SummaryItem
                title="Cuota"
                icon={ArrowDownCircleIcon}
                value={formatFinanceMoney(String(plan.installmentAmount), {
                  ...display,
                  currency,
                })}
                isLast={false}
              />
              <SummaryItem
                title="Cuotas"
                icon={HashIcon}
                value={`${plan.paidPeriods} / ${values.periods}`}
                isLast={false}
              />
              <SummaryItem
                title="Próximo pago"
                icon={CalendarIcon}
                value={format(plan.nextDueDate, "d MMM yyyy")}
                isLast={false}
              />
              <SummaryItem
                title="Intereses"
                icon={PercentIcon}
                value={formatFinanceMoney(String(plan.totalInterest), {
                  ...display,
                  currency,
                })}
                isLast
              />
            </SummarySection>

            <SummarySection title="Detalles opcionales" icon={CircleAlert} collapsible>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <FormTextField
                    icon={NotebookPenIcon}
                    label="Notas"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.notes?.message}
                  />
                )}
              />
            </SummarySection>
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-auto border-t bg-background px-4 pt-3 pb-4 md:-mx-6 md:px-6">
        {step === "review" ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              disabled={createMutation.isPending}
              onClick={goBack}
            >
              <InfoIcon className="size-4 shrink-0" />
              Ajustar
            </Button>
            <Button
              type="button"
              className="h-11 flex-1"
              disabled={createMutation.isPending}
              onClick={() => void onSubmit()}
            >
              {createMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              Crear préstamo
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="h-11 w-full"
            disabled={continueDisabled}
            onClick={goNext}
          >
            {step === "details" ? (
              <SparklesIcon className="size-4 shrink-0" />
            ) : null}
            {step === "details" ? "Calcular" : "Continuar"}
          </Button>
        )}
      </div>

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency}
        onSelect={(next) =>
          setValue("currency", next, { shouldValidate: true })
        }
      />

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={institutions}
        value={values?.institutionId ?? CATALOG_NONE}
        onSelect={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
      />

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
        accounts={accounts.filter((account) => account.isActive)}
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
