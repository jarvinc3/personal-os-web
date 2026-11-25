"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarIcon,
  CircleAlert,
  HashIcon,
  LandmarkIcon,
  NotebookPenIcon,
  PercentIcon,
  SaveIcon,
  WalletIcon,
} from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useUpdateLoan } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { rateFractionToPercent } from "@/src/modules/finance/shared/lib/interest-rate"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatPlanningDate } from "@/src/modules/finance/shared/lib/planning-lists"
import { buildLoanBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type {
  FinanceAccount,
  FinanceInstallmentFreq,
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/shared/types/entities"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_INSTALLMENT_FREQS,
} from "@/src/modules/finance/shared/types/entities"
import {
  loanSchema,
  type LoanFormValues,
} from "@/src/modules/finance/loans/lib/loan-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"

const FREQ_OPTIONS = FINANCE_INSTALLMENT_FREQS.map((value) => ({
  value,
  label: FINANCE_INSTALLMENT_FREQ_LABEL[value],
}))

function toFormValues(
  loan: FinanceLoan,
  defaultInstitutionId: string = CATALOG_NONE
): LoanFormValues {
  return {
    name: loan.name ?? "",
    lenderName: loan.lenderName,
    institutionId: loan.institutionId ?? defaultInstitutionId,
    accountId: loan.accountId ?? CATALOG_NONE,
    originalAmount: loan.originalAmount,
    currentBalance: loan.currentBalance,
    installmentAmount: loan.installmentAmount,
    installmentFreq: loan.installmentFreq,
    totalInstallments: String(loan.totalInstallments),
    paidInstallments: String(loan.paidInstallments),
    nextDueDate: formatPlanningDate(loan.nextDueDate) || todayDateInput(),
    interestRatePercent: rateFractionToPercent(loan.interestRate) ?? "",
    notes: loan.notes ?? "",
    currency: loan.currency,
  }
}

type LoanEditFormProps = {
  loan: FinanceLoan
  accounts: FinanceAccount[]
  institutions: FinanceInstitution[]
  defaultCurrency: string
  display: FinanceMoneyDisplay
  onDone: () => void
}

export function LoanEditForm({
  loan,
  accounts,
  institutions,
  defaultCurrency,
  display,
  onDone,
}: LoanEditFormProps) {
  const updateMutation = useUpdateLoan()
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<LoanFormValues>({
    mode: "onTouched",
    resolver: zodResolver(loanSchema),
    defaultValues: toFormValues(loan),
  })

  const selectedInstitutionId = useWatch({ control, name: "institutionId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const currency = useWatch({ control, name: "currency" })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "currency" | "institution" | "account"
  >("none")
  const selectedInstitution =
    institutions.find((item) => item.id === selectedInstitutionId) ?? null
  const pickerInstitutions =
    selectedInstitutionId === CATALOG_NONE
      ? institutions
      : institutions.filter((item) => item.id === selectedInstitutionId)
  const institutionAccounts = accounts.filter(
    (item) =>
      item.isActive &&
      (selectedInstitutionId === CATALOG_NONE ||
        item.institutionId === selectedInstitutionId)
  )
  const formValues = useWatch({ control })
  const formIsValid = loanSchema.safeParse(formValues).success
  const canSave = !updateMutation.isPending && formIsValid && isDirty

  useEffect(() => {
    if (
      selectedAccountId !== CATALOG_NONE &&
      !accounts.some(
        (item) =>
          item.id === selectedAccountId &&
          item.isActive &&
          (selectedInstitutionId === CATALOG_NONE ||
            item.institutionId === selectedInstitutionId)
      )
    ) {
      setValue("accountId", CATALOG_NONE)
    }
  }, [accounts, selectedAccountId, selectedInstitutionId, setValue])

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildLoanBody(values, { isUpdate: true })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await updateMutation.mutateAsync({ id: loan.id, body: payload.body })
      appToast.success({ text1: "Préstamo actualizado" })
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel="Guardar"
        submitIcon={SaveIcon}
        isSubmitting={updateMutation.isPending}
        submitDisabled={!canSave}
      >
        <SummarySection title="Préstamo" icon={LandmarkIcon}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Field
                data-invalid={errors.name ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="loan-name"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Nombre (opcional)
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <NotebookPenIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="loan-name"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    placeholder="Carro"
                    aria-invalid={errors.name ? true : undefined}
                  />
                </InputGroup>
                {errors.name?.message ? (
                  <FieldError>{errors.name.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="lenderName"
            render={({ field }) => (
              <Field
                data-invalid={errors.lenderName ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="loan-lender"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Prestamista
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <LandmarkIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="loan-lender"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    placeholder="Banco Popular"
                    aria-invalid={errors.lenderName ? true : undefined}
                  />
                </InputGroup>
                {errors.lenderName?.message ? (
                  <FieldError>{errors.lenderName.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Institución (opcional)
            </FieldLabel>
            <InstitutionTrigger
              institution={selectedInstitution}
              placeholder="Prestamista externo"
              onClick={() => openPicker("institution")}
            />
          </Field>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Cuenta de pago (opcional)
                </FieldLabel>
                <DestinationTrigger
                  destination={
                    field.value && field.value !== CATALOG_NONE
                      ? encodeLedgerTarget("account", field.value)
                      : CATALOG_NONE
                  }
                  accounts={institutionAccounts}
                  cards={[]}
                  display={display}
                  placeholder="Sin cuenta de pago"
                  onClick={() => openPicker("account")}
                />
              </Field>
            )}
          />
        </SummarySection>

        <SummarySection title="Montos" icon={WalletIcon}>
          <Controller
            control={control}
            name="originalAmount"
            render={({ field }) => (
              <FinanceMoneyField
                calculatorKey="loan-original-amount"
                label="Monto original"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("originalAmount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.originalAmount?.message}
                currency={currency || defaultCurrency}
                onCurrencyPress={() => openPicker("currency")}
              />
            )}
          />
          <Controller
            control={control}
            name="currentBalance"
            render={({ field }) => (
              <FinanceMoneyField
                calculatorKey="loan-current-debt"
                label="Deuda actual"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("currentBalance")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.currentBalance?.message}
                currency={currency || defaultCurrency}
              />
            )}
          />
          <Controller
            control={control}
            name="installmentAmount"
            render={({ field }) => (
              <FinanceMoneyField
                calculatorKey="loan-installment"
                label="Cuota"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("installmentAmount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.installmentAmount?.message}
                currency={currency || defaultCurrency}
              />
            )}
          />
        </SummarySection>

        <SummarySection title="Calendario" icon={CalendarIcon}>
          <Controller
            control={control}
            name="installmentFreq"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel>Frecuencia</FieldLabel>
                <ToggleGroup
                  value={[field.value]}
                  onValueChange={(next) => {
                    if (next.length > 0) {
                      field.onChange(next[0])
                    }
                  }}
                  variant="outline"
                  size="sm"
                  aria-label="Frecuencia"
                >
                  {FREQ_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      className="rounded-full"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            )}
          />
          <Controller
            control={control}
            name="totalInstallments"
            render={({ field }) => (
              <Field
                data-invalid={errors.totalInstallments ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="loan-total-installments"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Cuotas totales
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <HashIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="loan-total-installments"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    aria-invalid={errors.totalInstallments ? true : undefined}
                  />
                </InputGroup>
                {errors.totalInstallments?.message ? (
                  <FieldError>{errors.totalInstallments.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="paidInstallments"
            render={({ field }) => (
              <Field
                data-invalid={errors.paidInstallments ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="loan-paid-installments"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Cuotas pagadas
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <HashIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="loan-paid-installments"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    aria-invalid={errors.paidInstallments ? true : undefined}
                  />
                </InputGroup>
                {errors.paidInstallments?.message ? (
                  <FieldError>{errors.paidInstallments.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="nextDueDate"
            render={({ field }) => (
              <FinanceDateField
                label="Próximo vencimiento"
                value={field.value}
                onChange={field.onChange}
                error={errors.nextDueDate?.message}
              />
            )}
          />
        </SummarySection>

        <SummarySection
          title="Detalles opcionales"
          icon={CircleAlert}
          collapsible
          defaultOpen
        >
          <Controller
            control={control}
            name="interestRatePercent"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <Field
                  data-invalid={errors.interestRatePercent ? true : undefined}
                  className="gap-0.5"
                >
                  <FieldLabel
                    htmlFor="loan-rate"
                    className="pl-2 text-sm text-muted-foreground"
                  >
                    Tasa anual (%)
                  </FieldLabel>
                  <InputGroup className="h-10 overflow-hidden px-1">
                    <InputGroupAddon align="inline-start">
                      <PercentIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="loan-rate"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      placeholder="12"
                      aria-invalid={
                        errors.interestRatePercent ? true : undefined
                      }
                    />
                  </InputGroup>
                  {errors.interestRatePercent?.message ? (
                    <FieldError>
                      {errors.interestRatePercent.message}
                    </FieldError>
                  ) : null}
                </Field>
                <FieldDescription className="text-xs">
                  Vacío = sin tasa.
                </FieldDescription>
              </div>
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <Field
                data-invalid={errors.notes ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="loan-notes"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Notas
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <NotebookPenIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="loan-notes"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    aria-invalid={errors.notes ? true : undefined}
                  />
                </InputGroup>
                {errors.notes?.message ? (
                  <FieldError>{errors.notes.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
        </SummarySection>
      </FinanceFormScreen>

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={(next) =>
          setValue("currency", next, { shouldValidate: true })
        }
      />

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={institutions}
        value={selectedInstitutionId}
        noneLabel="Prestamista externo"
        onSelect={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
      />

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={pickerInstitutions}
        accounts={institutionAccounts}
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
