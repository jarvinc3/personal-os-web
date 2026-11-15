"use client"

import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  CountryPickerSheet,
  CountryTrigger,
} from "@/src/modules/finance/shared/components/pickers/country-picker"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CurrencyTriggerLabel } from "@/src/modules/finance/shared/components/currency-flag"
import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_TYPE_LABEL,
  FINANCE_CARD_NETWORKS,
  FINANCE_INSTITUTION_TYPE_LABEL,
  type FinanceCardNetwork,
} from "@/src/modules/finance/shared/constants/catalog"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { useUpdateEmailProductProposal } from "@/src/modules/finance/shared/hooks/use-email-product-proposals"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  buildProposalPatch,
  proposalFormSchemaFor,
  toProposalFormValues,
  type ProposalFormValues,
} from "@/src/modules/finance/product-proposals/lib/proposal-form"
import {
  EMAIL_PRODUCT_PROPOSAL_ACCOUNT_TYPES,
  EMAIL_PRODUCT_PROPOSAL_CARD_TYPES,
  EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES,
  type EmailProductProposal,
  type EmailProductProposalAccountType,
  type EmailProductProposalCardType,
  type EmailProductProposalInstitutionType,
  type FinanceAccount,
  type FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { getModule } from "@/src/shared/constants/module-registry"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2Icon,
  ChevronDownIcon,
  CoinsIcon,
  CreditCardIcon,
  EraserIcon,
  HashIcon,
  InfoIcon,
  LandmarkIcon,
  LockIcon,
  PiggyBankIcon,
  SaveIcon,
  ShapesIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  TypeIcon,
  Undo2Icon,
  UsersIcon,
  WalletIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

const ACCOUNT_TYPE_ICON: Record<EmailProductProposalAccountType, LucideIcon> = {
  CHECKING: LandmarkIcon,
  SAVINGS: PiggyBankIcon,
  INVESTMENT: TrendingUpIcon,
}

const CARD_TYPE_ICON: Record<EmailProductProposalCardType, LucideIcon> = {
  CREDIT: CreditCardIcon,
  DEBIT: CreditCardIcon,
}

const PROPOSAL_INSTITUTION_TYPE_ICON: Record<
  EmailProductProposalInstitutionType,
  LucideIcon
> = {
  bank: LandmarkIcon,
  credit_union: UsersIcon,
  digital_wallet: SmartphoneIcon,
  broker: TrendingUpIcon,
  other: ShapesIcon,
}

const ACCOUNT_TYPE_OPTIONS = EMAIL_PRODUCT_PROPOSAL_ACCOUNT_TYPES.map(
  (value) => ({
    value,
    label: FINANCE_ACCOUNT_TYPE_LABEL[value],
    icon: ACCOUNT_TYPE_ICON[value],
  })
)

const CARD_TYPE_OPTIONS = EMAIL_PRODUCT_PROPOSAL_CARD_TYPES.map((value) => ({
  value,
  label: FINANCE_CARD_TYPE_LABEL[value],
  icon: CARD_TYPE_ICON[value],
}))

const NETWORK_OPTIONS = FINANCE_CARD_NETWORKS.map((value) => ({
  value,
  label: FINANCE_CARD_NETWORK_LABEL[value],
  icon: CreditCardIcon,
}))

const INSTITUTION_TYPE_OPTIONS = EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES.map(
  (value) => ({
    value,
    label: FINANCE_INSTITUTION_TYPE_LABEL[value],
    icon: PROPOSAL_INSTITUTION_TYPE_ICON[value],
  })
)

type ProposalEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposal: EmailProductProposal
  accounts: FinanceAccount[]
  institutions: FinanceInstitution[]
  display: FinanceMoneyDisplay
}

/**
 * Edita el borrador de una propuesta antes de aprobarla. El formulario solo
 * manda campos del tipo de producto: el back rechaza los de cuenta en una
 * tarjeta y los de tarjeta en una cuenta.
 */
export function ProposalEditSheet({
  open,
  onOpenChange,
  proposal,
  accounts,
  institutions,
  display,
}: ProposalEditSheetProps) {
  const accentColor = getModule("finance").accent
  const updateMutation = useUpdateEmailProductProposal()
  const isPending = updateMutation.isPending
  const isAccount = proposal.productType === "ACCOUNT"
  const resolver = useMemo(
    () => zodResolver(proposalFormSchemaFor(proposal)),
    [proposal]
  )
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProposalFormValues>({
    resolver,
    defaultValues: toProposalFormValues(proposal),
    mode: "onTouched",
  })
  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "account" | "currency" | "country"
  >("none")
  const accountId = useWatch({ control, name: "accountId" })
  const clearAccountNumber = useWatch({
    control,
    name: "clearAccountNumber",
  })
  const currency = useWatch({ control, name: "currency" })
  const institutionCountry = useWatch({ control, name: "institutionCountry" })
  const destination = accountId ? encodeLedgerTarget("account", accountId) : ""

  const typeOptions = isAccount ? ACCOUNT_TYPE_OPTIONS : CARD_TYPE_OPTIONS

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )
  function requestStoredNumberRemoval() {
    setValue("accountNumber", "", { shouldDirty: true })
    setValue("clearAccountNumber", true, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onSubmit = submitForm(async (values) => {
    try {
      await updateMutation.mutateAsync({
        proposalId: proposal.id,
        body: buildProposalPatch({ proposal, values }),
      })
      appToast.success({ text1: "Propuesta actualizada" })
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
        pending={isPending}
        title="Editar propuesta"
        description="Revisa el borrador antes de aprobarlo"
        actions={{
          close: (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isPending}
              onClick={() => requestOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" aria-hidden />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              type="button"
              className="flex-1"
              disabled={isPending || !isDirty}
              onClick={onSubmit}
            >
              {isPending ? (
                <Spinner className="size-4" />
              ) : (
                <SaveIcon className="size-4 shrink-0" aria-hidden />
              )}
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          ),
        }}
      >
        <SummarySection
          title="Producto"
          icon={isAccount ? WalletIcon : CreditCardIcon}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormTextField
                icon={TypeIcon}
                label="Nombre"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SegmentedControl
                label="Tipo"
                value={field.value}
                onChange={field.onChange}
                options={typeOptions}
                error={errors.type?.message}
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
                inputMode="numeric"
                maxLength={4}
              />
            )}
          />
          {isAccount ? (
            <>
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Moneda
                </FieldLabel>
                <button
                  type="button"
                  className={cn(
                    "flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 text-left",
                    PRESSABLE_CLASS
                  )}
                  onClick={() => openPicker("currency")}
                >
                  <CoinsIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    <CurrencyTriggerLabel code={currency} />
                  </span>
                  <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </Field>
              {clearAccountNumber ? (
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 py-2">
                  <span className="min-w-0 flex-1 text-xs text-muted-foreground">
                    El número completo guardado se quitará al guardar.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValue("clearAccountNumber", false, {
                        shouldDirty: true,
                      })
                    }
                  >
                    <Undo2Icon className="size-4 shrink-0" aria-hidden />
                    Conservar
                  </Button>
                </div>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormTextField
                        icon={LockIcon}
                        label="Número completo (opcional)"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.accountNumber?.message}
                        description={
                          proposal.draft.accountNumberProvided
                            ? "Ya hay un número guardado. Escríbelo solo si quieres cambiarlo."
                            : "Basta con los últimos 4 dígitos. El número nunca se muestra."
                        }
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={48}
                      />
                    )}
                  />
                  {proposal.draft.accountNumberProvided ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={requestStoredNumberRemoval}
                    >
                      <EraserIcon className="size-4 shrink-0" aria-hidden />
                      Quitar número guardado
                    </Button>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <>
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Red
                </FieldLabel>
                <Controller
                  control={control}
                  name="network"
                  render={({ field }) => (
                    <ChoiceGrid<FinanceCardNetwork | "">
                      ariaLabel="Red de la tarjeta"
                      accentColor={accentColor}
                      value={field.value}
                      onValueChange={field.onChange}
                      options={NETWORK_OPTIONS}
                    />
                  )}
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Cuenta de la tarjeta
                </FieldLabel>
                <DestinationTrigger
                  destination={destination}
                  accounts={accounts}
                  cards={[]}
                  display={display}
                  placeholder="Elige la cuenta"
                  onClick={() => openPicker("account")}
                />
              </Field>
            </>
          )}
        </SummarySection>

        <SummarySection title="Institución" icon={Building2Icon}>
          <Controller
            control={control}
            name="institutionName"
            render={({ field }) => (
              <FormTextField
                icon={Building2Icon}
                label="Nombre"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.institutionName?.message}
              />
            )}
          />
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Tipo
            </FieldLabel>
            <Controller
              control={control}
              name="institutionType"
              render={({ field }) => (
                <ChoiceGrid<EmailProductProposalInstitutionType>
                  ariaLabel="Tipo de institución"
                  accentColor={accentColor}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={INSTITUTION_TYPE_OPTIONS}
                />
              )}
            />
          </Field>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              País
            </FieldLabel>
            <CountryTrigger
              country={institutionCountry}
              onClick={() => openPicker("country")}
            />
          </Field>
        </SummarySection>

        <SummarySection
          title="Detalles opcionales"
          icon={InfoIcon}
          collapsible
          defaultOpen
        >
          <Controller
            control={control}
            name="institutionDomain"
            render={({ field }) => (
              <FormTextField
                icon={LandmarkIcon}
                label="Sitio web"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.institutionDomain?.message}
                placeholder="bhd.com.do"
                autoComplete="off"
              />
            )}
          />
        </SummarySection>
      </BottomSheet>

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency}
        onSelect={(code) =>
          setValue("currency", code, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
      <CountryPickerSheet
        open={picker === "country"}
        onOpenChange={closeHandlerFor("country")}
        value={institutionCountry}
        onSelect={(code) =>
          setValue("institutionCountry", code, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
        accounts={accounts}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(value) =>
          setValue("accountId", splitLedgerTarget(value).accountId ?? null, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
      {discardChangesDialog}
    </>
  )
}
