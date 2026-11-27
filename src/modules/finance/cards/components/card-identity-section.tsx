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
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
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
          <Field
            data-invalid={errors.name ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="card-name"
              className="pl-2 text-sm text-muted-foreground"
            >
              Nombre
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <CreditCardIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="card-name"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                placeholder="Visa principal"
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
        name="lastFour"
        render={({ field }) => (
          <Field
            data-invalid={errors.lastFour ? true : undefined}
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor="card-last-four"
              className="pl-2 text-sm text-muted-foreground"
            >
              Últimos 4 dígitos
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <HashIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="card-last-four"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                placeholder="1234"
                aria-invalid={errors.lastFour ? true : undefined}
              />
            </InputGroup>
            {errors.lastFour?.message ? (
              <FieldError>{errors.lastFour.message}</FieldError>
            ) : null}
          </Field>
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
