"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import {
  FIELD_CHOICE_CLASS_NAME,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldMedia,
  FieldTitle,
  activeRowStyle,
} from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { getModule } from "@/src/shared/constants/module-registry"

const MODULE_ACCENT = getModule("finance").accent

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
      <FieldLabel
        onClick={() => onSelectWho("BANK")}
        className={cn(FIELD_CHOICE_CLASS_NAME, "border-border bg-card")}
        style={activeRowStyle(MODULE_ACCENT, who === "BANK")}
      >
        <FieldMedia icon={LandmarkIcon} />
        <FieldContent>
          <FieldTitle className="text-sm">Un banco o financiera</FieldTitle>
          <FieldDescription className="text-xs text-muted-foreground">
            Usa tus instituciones
          </FieldDescription>
        </FieldContent>
      </FieldLabel>
      <FieldLabel
        onClick={() => onSelectWho("PERSON")}
        className={cn(FIELD_CHOICE_CLASS_NAME, "border-border bg-card")}
        style={activeRowStyle(MODULE_ACCENT, who === "PERSON")}
      >
        <FieldMedia icon={UserIcon} />
        <FieldContent>
          <FieldTitle className="text-sm">Una persona</FieldTitle>
          <FieldDescription className="text-xs text-muted-foreground">
            Familiar o amigo
          </FieldDescription>
        </FieldContent>
      </FieldLabel>
      {who === "PERSON" ? (
        <Controller
          control={control}
          name="lenderName"
          render={({ field }) => (
            <Field
              data-invalid={errors.lenderName ? true : undefined}
              className="gap-0.5"
            >
              <FieldLabel
                htmlFor="wizard-lender"
                className="pl-2 text-sm text-muted-foreground"
              >
                Prestamista
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <UserIcon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="wizard-lender"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  placeholder="Juan Pérez"
                  aria-invalid={errors.lenderName ? true : undefined}
                />
              </InputGroup>
              {errors.lenderName?.message ? (
                <FieldError>{errors.lenderName.message}</FieldError>
              ) : null}
            </Field>
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
      <FieldDescription className="text-xs">
        El nombre del prestamista se toma del banco.
      </FieldDescription>
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
              calculatorKey="loan-wizard-principal"
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
          name="periods"
          render={({ field }) => (
            <Field className="gap-1">
              <FieldLabel>Plazo</FieldLabel>
              <ToggleGroup
                value={[field.value]}
                onValueChange={(next) => {
                  if (next.length > 0) {
                    field.onChange(next[0])
                  }
                }}
                variant="outline"
                size="sm"
                aria-label="Plazo"
              >
                {TERM_OPTIONS.map((option) => (
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
          name="known"
          render={({ field }) => (
            <Field className="gap-1">
              <FieldLabel>Conoces</FieldLabel>
              <ToggleGroup
                value={[field.value]}
                onValueChange={(next) => {
                  if (next.length > 0) {
                    field.onChange(next[0])
                  }
                }}
                variant="outline"
                size="sm"
                aria-label="Conoces"
              >
                {KNOWN_OPTIONS.map((option) => (
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
        {known === "RATE" ? (
          <Controller
            control={control}
            name="ratePercent"
            render={({ field }) => (
              <Field
                data-invalid={errors.ratePercent ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="wizard-rate"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Tasa anual (%)
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <PercentIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="wizard-rate"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    placeholder="14.5"
                    aria-invalid={errors.ratePercent ? true : undefined}
                  />
                </InputGroup>
                {errors.ratePercent?.message ? (
                  <FieldError>{errors.ratePercent.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
        ) : (
          <Controller
            control={control}
            name="installment"
            render={({ field }) => (
              <FinanceMoneyField
                calculatorKey="loan-wizard-installment"
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
            <Field
              data-invalid={errors.name ? true : undefined}
              className="gap-0.5"
            >
              <FieldLabel
                htmlFor="wizard-name"
                className="pl-2 text-sm text-muted-foreground"
              >
                Nombre (opcional)
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <NotebookPenIcon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="wizard-name"
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
        <FieldDescription className="text-xs">
          Si eliges dónde entró el dinero, el saldo de esa cuenta sube y no
          cuenta como ingreso.
        </FieldDescription>
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
            <Field className="gap-1">
              <FieldLabel>Tipo de tasa</FieldLabel>
              <ToggleGroup
                value={[field.value]}
                onValueChange={(next) => {
                  if (next.length > 0) {
                    field.onChange(next[0])
                  }
                }}
                variant="outline"
                size="sm"
                aria-label="Tipo de tasa"
              >
                {RATE_TYPE_OPTIONS.map((option) => (
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
          name="insuranceAmount"
          render={({ field }) => (
            <FinanceMoneyField
              calculatorKey="loan-wizard-insurance"
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
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemMedia variant="icon">
            <WalletIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Pendiente"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {formatFinanceMoney(String(plan.outstandingBalance), money)}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemMedia variant="icon">
            <ArrowDownCircleIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Cuota"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {formatFinanceMoney(String(plan.installmentAmount), money)}
            </span>
          </ItemActions>
        </Item>
        {plan.lastInstallmentAmount !== plan.installmentAmount ? (
          <Item variant="plain" className={"border-b border-border/60"}>
            <ItemMedia variant="icon">
              <ArrowDownCircleIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Última cuota"}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span className="text-sm font-semibold tabular-nums">
                {formatFinanceMoney(String(plan.lastInstallmentAmount), money)}
              </span>
            </ItemActions>
          </Item>
        ) : null}
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemMedia variant="icon">
            <HashIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Cuotas"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {`${plan.paidPeriods} / ${values.periods}`}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemMedia variant="icon">
            <CalendarIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Próximo pago"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {format(plan.nextDueDate, "d MMM yyyy")}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain">
          <ItemMedia variant="icon">
            <PercentIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Intereses"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {formatFinanceMoney(String(plan.totalInterest), money)}
            </span>
          </ItemActions>
        </Item>
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
            <Field
              data-invalid={errors.notes ? true : undefined}
              className="gap-0.5"
            >
              <FieldLabel
                htmlFor="wizard-notes"
                className="pl-2 text-sm text-muted-foreground"
              >
                Notas
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <NotebookPenIcon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="wizard-notes"
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
    </>
  )
}
