"use client"

import { InstitutionTrigger } from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { CreditCardIcon, HashIcon } from "lucide-react"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

type CardIdentitySectionProps = {
  control: Control<CardFormValues>
  errors: FieldErrors<CardFormValues>
  cardType: CardFormValues["type"]
  selectedInstitution: FinanceInstitution | null
  hasInstitutions: boolean
  institutionAccounts: FinanceAccount[]
  selectedAccountId: string
  display: FinanceMoneyDisplay
  onOpenInstitution: () => void
  onOpenAccount: () => void
}

export function CardIdentitySection({
  control,
  errors,
  cardType,
  selectedInstitution,
  hasInstitutions,
  institutionAccounts,
  selectedAccountId,
  display,
  onOpenInstitution,
  onOpenAccount,
}: CardIdentitySectionProps) {
  return (
    <SummarySection title="Tarjeta" icon={CreditCardIcon}>
      <Field className="gap-1">
        <FieldLabel className="text-sm text-muted-foreground">
          Institución
        </FieldLabel>
        <InstitutionTrigger
          institution={selectedInstitution}
          placeholder={
            hasInstitutions
              ? "Elige la institución"
              : "Crea una institución primero"
          }
          disabled={!hasInstitutions}
          onClick={onOpenInstitution}
        />
        {errors.institutionId?.message ? (
          <FieldError>{errors.institutionId.message}</FieldError>
        ) : null}
      </Field>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FormTextField
            icon={CreditCardIcon}
            label="Nombre"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
            placeholder="Visa principal"
          />
        )}
      />
      <Controller
        control={control}
        name="lastFour"
        render={({ field }) => (
          <FormTextField
            icon={HashIcon}
            label="Últimos 4 dígitos"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.lastFour?.message}
            placeholder="1234"
          />
        )}
      />
      {cardType === "DEBIT" ? (
        <Field className="gap-1">
          <FieldLabel className="text-sm text-muted-foreground">
            Cuenta asociada
          </FieldLabel>
          <DestinationTrigger
            destination={
              selectedAccountId && selectedAccountId !== CATALOG_NONE
                ? encodeLedgerTarget("account", selectedAccountId)
                : CATALOG_NONE
            }
            accounts={institutionAccounts}
            cards={[]}
            display={display}
            onClick={onOpenAccount}
          />
          {errors.accountId?.message ? (
            <FieldError>{errors.accountId.message}</FieldError>
          ) : null}
        </Field>
      ) : null}
    </SummarySection>
  )
}
