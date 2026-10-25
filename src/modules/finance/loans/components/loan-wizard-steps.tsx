"use client"

import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { format } from "date-fns"
import {
  ArrowDownCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  CircleAlert,
  HashIcon,
  LandmarkIcon,
  NotebookPenIcon,
  PercentIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormTrigger,
} from "react-hook-form"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceHelpText } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { InstitutionTrigger } from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_INSTALLMENT_FREQS,
  type FinanceAccount,
  type FinanceInstitution,
  type FinanceInstallmentFreq,
} from "@/src/modules/finance/shared/types/entities"
import {
  LOAN_WIZARD_TERMS,
  type LoanWizardValues,
} from "@/src/modules/finance/loans/lib/loan-form"
import type { LoanPlan } from "@/src/modules/finance/loans/lib/loan-wizard"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { OptionRow } from "@/src/shared/components/forms/option-row"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"

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

const RATE_TYPE_OPTIONS = [
  { value: "FIXED", label: "Fija" },
  { value: "VARIABLE", label: "Variable" },
]

const CALCULATING_STEPS = [
  "Cuota mensual",
  "Cuotas pagadas",
  "Saldo pendiente",
  "Calendario",
]

type LoanWizardStepForm = {
  control: Control<LoanWizardValues>
  errors: FieldErrors<LoanWizardValues>
}

export function LoanWizardProgress({
  stepIndex,
  totalSteps,
  showBack,
  onBack,
}: {
  stepIndex: number
  totalSteps: number
  showBack: boolean
  onBack: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      {showBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Atrás"
          className="size-9 shrink-0 rounded-full"
          onClick={onBack}
        >
          <ArrowLeftIcon className="size-4.5" />
        </Button>
      ) : null}
      <div className="flex flex-1 gap-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full",
              index <= stepIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function LoanWizardWhoStep({
  control,
  errors,
  values,
  onSelectWho,
}: LoanWizardStepForm & {
  values: LoanWizardValues
  onSelectWho: (who: LoanWizardValues["who"]) => void
}) {
  const who = values.who ?? "BANK"
  return (
    <SummarySection title="¿Con quién es el préstamo?" icon={LandmarkIcon}>
      <OptionRow
        label="Un banco o financiera"
        description="Usa tus instituciones"
        icon={LandmarkIcon}
        selected={who === "BANK"}
        onPress={() => onSelectWho("BANK")}
      />
      <OptionRow
        label="Una persona"
        description="Familiar o amigo"
        icon={UserIcon}
        selected={who === "PERSON"}
        onPress={() => onSelectWho("PERSON")}
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
  )
}

export function LoanWizardInstitutionStep({
  selectedInstitution,
  error,
  onPick,
}: {
  selectedInstitution: FinanceInstitution | null
  error?: string
  onPick: () => void
}) {
  return (
    <SummarySection title="Institución" icon={LandmarkIcon}>
      <Field className="gap-1">
        <FieldLabel className="text-sm text-muted-foreground">
          Banco o financiera
        </FieldLabel>
        <InstitutionTrigger
          institution={selectedInstitution}
          placeholder="Elige la institución"
          onClick={onPick}
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      <FinanceHelpText>
        El nombre del prestamista se toma del banco.
      </FinanceHelpText>
    </SummarySection>
  )
}

export function LoanWizardDetailsStep({
  control,
  errors,
  trigger,
  values,
  accounts,
  display,
  onPickCurrency,
  onPickAccount,
  onPickDisbursement,
}: LoanWizardStepForm & {
  trigger: UseFormTrigger<LoanWizardValues>
  values: LoanWizardValues
  accounts: readonly FinanceAccount[]
  display: FinanceMoneyDisplay
  onPickCurrency: () => void
  onPickAccount: () => void
  onPickDisbursement: () => void
}) {
  const currency = values.currency
  const known = values.known ?? "RATE"
  return (
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
              onCurrencyPress={onPickCurrency}
            />
          )}
        />
        <Controller
          control={control}
          name="freq"
          render={({ field }) => (
            <SegmentedControl
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
            <SegmentedControl
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
            <SegmentedControl
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
          name="name"
          render={({ field }) => (
            <FormTextField
              icon={NotebookPenIcon}
              label="Nombre (opcional)"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
              placeholder="Carro"
            />
          )}
        />
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
                onClick={onPickAccount}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="disbursementAccountId"
          render={({ field }) => (
            <Field className="gap-1">
              <FieldLabel className="text-sm text-muted-foreground">
                Entró en (opcional)
              </FieldLabel>
              <DestinationTrigger
                destination={
                  field.value && field.value !== CATALOG_NONE
                    ? encodeLedgerTarget("account", field.value)
                    : CATALOG_NONE
                }
                accounts={accounts.filter(
                  (account) => account.isActive && account.currency === currency
                )}
                cards={[]}
                display={display}
                placeholder="Sin cuenta de desembolso"
                onClick={onPickDisbursement}
              />
            </Field>
          )}
        />
        <FinanceHelpText>
          Si eliges dónde entró el dinero, el saldo de esa cuenta sube y no
          cuenta como ingreso.
        </FinanceHelpText>
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
            <SegmentedControl
              label="Tipo de tasa"
              value={field.value}
              onChange={(value) =>
                field.onChange(value as "FIXED" | "VARIABLE")
              }
              options={RATE_TYPE_OPTIONS}
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
  )
}

export function LoanWizardCalculatingStep() {
  return (
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
  )
}

export function LoanWizardReviewStep({
  control,
  errors,
  values,
  plan,
  display,
}: LoanWizardStepForm & {
  values: LoanWizardValues
  plan: LoanPlan
  display: FinanceMoneyDisplay
}) {
  const money = { ...display, currency: values.currency }
  return (
    <>
      <SummarySection title="Revisa" icon={SparklesIcon}>
        <SummaryItem
          title="Pendiente"
          icon={WalletIcon}
          value={formatFinanceMoney(String(plan.outstandingBalance), money)}
          isLast={false}
        />
        <SummaryItem
          title="Cuota"
          icon={ArrowDownCircleIcon}
          value={formatFinanceMoney(String(plan.installmentAmount), money)}
          isLast={false}
        />
        {plan.lastInstallmentAmount !== plan.installmentAmount ? (
          <SummaryItem
            title="Última cuota"
            icon={ArrowDownCircleIcon}
            value={formatFinanceMoney(
              String(plan.lastInstallmentAmount),
              money
            )}
            isLast={false}
          />
        ) : null}
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
          value={formatFinanceMoney(String(plan.totalInterest), money)}
          isLast
        />
      </SummarySection>

      <SummarySection
        title="Detalles opcionales"
        icon={CircleAlert}
        collapsible
      >
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
  )
}
