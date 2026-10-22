"use client"

import { format } from "date-fns"
import { InfoIcon, SaveIcon, SparklesIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import { InstitutionPickerSheet } from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateLoan } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { splitLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { buildLoanBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import {
  loanWizardSchema,
  type LoanWizardValues,
} from "@/src/modules/finance/loans/lib/loan-form"
import { roundToCents } from "@/src/modules/finance/loans/lib/loan-wizard"
import { loanWizardPlan } from "@/src/modules/finance/loans/lib/loan-wizard-plan"
import {
  LoanWizardCalculatingStep,
  LoanWizardDetailsStep,
  LoanWizardInstitutionStep,
  LoanWizardProgress,
  LoanWizardReviewStep,
  LoanWizardWhoStep,
} from "@/src/modules/finance/loans/components/loan-wizard-steps"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"

type WizardStep = "who" | "institution" | "details" | "calculating" | "review"

const STEP_ORDER: WizardStep[] = [
  "who",
  "institution",
  "details",
  "calculating",
  "review",
]

function wizardDefaults(
  defaultCurrency: string,
  defaultInstitutionId: string,
  prefill: Partial<LoanWizardValues>
): LoanWizardValues {
  return {
    who: "BANK",
    name: "",
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
    disbursementAccountId: CATALOG_NONE,
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
    "none" | "institution" | "account" | "disbursement" | "currency"
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
    const chosen = getValues("disbursementAccountId")
    if (!chosen || chosen === CATALOG_NONE) {
      return
    }
    const account = accounts.find((item) => item.id === chosen)
    if (account && account.currency !== values?.currency) {
      setValue("disbursementAccountId", CATALOG_NONE, {
        shouldValidate: true,
      })
    }
  }, [accounts, values?.currency, getValues, setValue])

  useEffect(() => {
    if (step !== "calculating") {
      return
    }
    const timer = setTimeout(() => setStep("review"), 700)
    return () => clearTimeout(timer)
  }, [step])

  const plan = useMemo(() => loanWizardPlan({ values }), [values])

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
      name: formValues.name,
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
      disbursementAccountId: formValues.disbursementAccountId,
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
      const hasDisbursement =
        formValues.disbursementAccountId !== CATALOG_NONE &&
        formValues.disbursementAccountId !== ""
      appToast.success({
        text1: "Préstamo creado",
        text2: hasDisbursement
          ? "El capital entró a la cuenta elegida."
          : "El dinero no entró a ninguna cuenta.",
      })
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
  const activeAccounts = accounts.filter((account) => account.isActive)

  return (
    <>
      <div className="flex flex-col gap-4 pb-4">
        <LoanWizardProgress
          stepIndex={stepIndex}
          totalSteps={STEP_ORDER.length}
          showBack={step !== "who" && step !== "calculating"}
          onBack={goBack}
        />

        {step === "who" ? (
          <LoanWizardWhoStep
            control={control}
            errors={errors}
            values={values}
            onSelectWho={(next) =>
              setValue("who", next, { shouldValidate: true })
            }
          />
        ) : null}

        {step === "institution" ? (
          <LoanWizardInstitutionStep
            selectedInstitution={selectedInstitution}
            error={errors.institutionId?.message}
            onPick={() => openPicker("institution")}
          />
        ) : null}

        {step === "details" ? (
          <LoanWizardDetailsStep
            control={control}
            errors={errors}
            trigger={trigger}
            values={values}
            accounts={activeAccounts}
            display={display}
            onPickCurrency={() => openPicker("currency")}
            onPickAccount={() => openPicker("account")}
            onPickDisbursement={() => openPicker("disbursement")}
          />
        ) : null}

        {step === "calculating" ? <LoanWizardCalculatingStep /> : null}

        {step === "review" && plan ? (
          <LoanWizardReviewStep
            control={control}
            errors={errors}
            values={values}
            plan={plan}
            display={display}
          />
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
        value={values?.currency ?? defaultCurrency}
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

      <DestinationPickerSheet
        open={picker === "disbursement"}
        onOpenChange={closeHandlerFor("disbursement")}
        institutions={institutions}
        accounts={activeAccounts.filter(
          (account) => account.currency === values?.currency
        )}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(next) =>
          setValue(
            "disbursementAccountId",
            splitLedgerTarget(next).accountId ?? "",
            { shouldValidate: true }
          )
        }
      />
    </>
  )
}
