"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarDays,
  CircleAlert,
  CreditCardIcon,
  FileTextIcon,
  HashIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  TrashIcon,
  WalletIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"

import { CardNetworkMark } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import {
  CATALOG_NONE,
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_NETWORKS,
  FINANCE_CARD_TYPE_LABEL,
  FINANCE_CARD_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  useCreateCard,
  useUpdateCard,
  useUpdateCardBalance,
} from "@/src/modules/finance/shared/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  buildCardBalanceBodies,
  buildCreateCardBody,
  cardBalanceSaveMessage,
  nextUnusedCurrency,
} from "@/src/modules/finance/shared/lib/catalog-payloads"
import { canManageCardBalances } from "@/src/modules/finance/shared/lib/card-balances"
import { buildFinanceCurrencyOptions } from "@/src/modules/finance/shared/lib/finance-currency"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import {
  cardSchema,
  institutionAccountOptions,
  type CardFormValues,
} from "@/src/modules/finance/cards/lib/card-form"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Label } from "@/src/shared/components/ui/label"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"

const TYPE_OPTIONS = FINANCE_CARD_TYPES.map((value) => ({
  value,
  label: FINANCE_CARD_TYPE_LABEL[value],
}))

const NETWORK_OPTIONS = FINANCE_CARD_NETWORKS.map((value) => ({
  value,
  label: FINANCE_CARD_NETWORK_LABEL[value],
}))

function emptyBalanceRow(currency: string) {
  return { currency, balance: "", creditLimit: "" }
}

function toFormValues(input: {
  card: FinanceCard | null
  defaultCurrency: string
  defaultInstitutionId: string
}): CardFormValues {
  const { card, defaultCurrency, defaultInstitutionId } = input
  return {
    name: card?.name ?? "",
    type: card?.type ?? "CREDIT",
    institutionId: card?.institutionId ?? defaultInstitutionId,
    accountId: card?.accountId ?? CATALOG_NONE,
    network: card?.network ?? "VISA",
    lastFour: card?.lastFour ?? "",
    statementClosingDay: card?.statementClosingDay
      ? String(card.statementClosingDay)
      : "",
    paymentDueDay: card?.paymentDueDay ? String(card.paymentDueDay) : "",
    color: card?.color ?? "",
    balances: [emptyBalanceRow(card?.balances[0]?.currency ?? defaultCurrency)],
  }
}

type CardFormScreenProps = {
  card?: FinanceCard | null
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  defaultCurrency: string
  defaultInstitutionId?: string
  display: FinanceMoneyDisplay
  onDone: () => void
  onUpdateBalance?: (card: FinanceCard) => void
  onReadStatement?: () => void
}

export function CardFormScreen({
  card = null,
  institutions,
  accounts,
  defaultCurrency,
  defaultInstitutionId,
  display,
  onDone,
  onUpdateBalance,
  onReadStatement,
}: CardFormScreenProps) {
  const isEdit = Boolean(card)
  const createMutation = useCreateCard()
  const updateMutation = useUpdateCard()
  const balanceMutation = useUpdateCardBalance()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    balanceMutation.isPending
  const { config: financeConfig } = useFinanceEnabled()
  const resolvedDefaultInstitutionId =
    defaultInstitutionId ?? institutions[0]?.id ?? ""

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<CardFormValues>({
    mode: "onTouched",
    resolver: zodResolver(cardSchema),
    defaultValues: toFormValues({
      card,
      defaultCurrency,
      defaultInstitutionId: resolvedDefaultInstitutionId,
    }),
  })

  const {
    fields: balanceFields,
    append: appendBalance,
    remove: removeBalance,
  } = useFieldArray({ control, name: "balances" })

  const cardType = useWatch({ control, name: "type" })
  const selectedInstitutionId = useWatch({ control, name: "institutionId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const watchedBalances = useWatch({ control, name: "balances" })
  const cardName = useWatch({ control, name: "name" })
  const cardNetwork = useWatch({ control, name: "network" })
  const cardColor = useWatch({ control, name: "color" })
  const lastFour = useWatch({ control, name: "lastFour" })
  const selectedInstitution =
    institutions.find((item) => item.id === selectedInstitutionId) ?? null
  const institutionAccounts = institutionAccountOptions(
    accounts,
    selectedInstitutionId
  )
  const hasInstitutions = institutions.length > 0
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution" | "account" | "currency"
  >("none")
  const [currencyRowIndex, setCurrencyRowIndex] = useState<number | null>(null)
  const formValues = useWatch({ control })
  const formIsValid = cardSchema.safeParse(formValues).success
  const canSave =
    !isPending && (isEdit ? isDirty : formIsValid && hasInstitutions)
  const allowedCurrencies = buildFinanceCurrencyOptions(
    defaultCurrency,
    financeConfig.trackedCurrencies
  )
  const usedCurrencies = (watchedBalances ?? []).map((row) => row.currency)
  const canAddCurrency = allowedCurrencies.some(
    (code) => !usedCurrencies.some((used) => used.toUpperCase() === code)
  )

  useEffect(() => {
    if (selectedAccountId === CATALOG_NONE) {
      return
    }
    const accountIsOffered = institutionAccountOptions(
      accounts,
      selectedInstitutionId
    ).some((account) => account.id === selectedAccountId)
    if (!accountIsOffered) {
      setValue("accountId", CATALOG_NONE)
    }
  }, [accounts, selectedAccountId, selectedInstitutionId, setValue])

  const previewBalance = watchedBalances?.[0]
  const previewCurrency = previewBalance?.currency ?? defaultCurrency
  const previewAmount = parseFinanceMoney(previewBalance?.balance ?? null)
  const previewLimit = parseFinanceMoney(previewBalance?.creditLimit ?? null)
  const previewValue =
    cardType === "CREDIT"
      ? Math.max(0, (previewLimit ?? 0) - (previewAmount ?? 0))
      : (previewAmount ?? 0)

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildCreateCardBody(values, { isUpdate: isEdit })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    const balancesPayload =
      card || values.type === "DEBIT"
        ? { ok: true as const, body: [] }
        : buildCardBalanceBodies(values.balances, {
            requireCreditLimit: values.type === "CREDIT",
          })
    if (!balancesPayload.ok) {
      appToast.error({ text1: balancesPayload.error })
      return
    }
    try {
      if (card) {
        await updateMutation.mutateAsync({ id: card.id, body: payload.body })
        appToast.success({ text1: "Tarjeta actualizada" })
      } else {
        const created = await createMutation.mutateAsync(payload.body)
        const failedCurrencies: string[] = []
        for (const body of balancesPayload.body) {
          try {
            await balanceMutation.mutateAsync({ id: created.id, body })
          } catch (error) {
            failedCurrencies.push(
              `${body.currency}: ${financeErrorMessage(error)}`
            )
          }
        }
        const message = cardBalanceSaveMessage({
          created: true,
          total: balancesPayload.body.length,
          failedCurrencies,
        })
        appToast[message.kind]({ text1: message.text1, text2: message.text2 })
      }
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel={isEdit ? "Guardar" : "Crear tarjeta"}
        submitIcon={SaveIcon}
        isSubmitting={isPending}
        submitDisabled={!canSave}
      >
        <div
          className={cn(
            "flex flex-col gap-6 rounded-3xl p-5 text-white",
            !cardColor && "bg-zinc-900"
          )}
          style={cardColor ? { backgroundColor: cardColor } : undefined}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold">
              {cardName.trim() || "Nueva tarjeta"}
            </p>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
              {FINANCE_CARD_TYPE_LABEL[cardType]}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.14em] text-white/55 uppercase">
              {cardType === "CREDIT" ? "Disponible" : "Saldo"}
            </span>
            <span className="text-3xl font-bold tabular-nums">
              {formatFinanceMoney(String(previewValue), {
                ...display,
                currency: previewCurrency,
              })}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className="tracking-[0.2em] text-white/80">
              •••• {lastFour || "····"}
            </span>
            <CardNetworkMark network={cardNetwork} logoUrl={null} size={28} />
          </div>
        </div>

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <FinanceSegmentedControl
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
              size="lg"
              fullWidth
            />
          )}
        />

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
              onClick={() => openPicker("institution")}
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
                onClick={() => openPicker("account")}
              />
              {errors.accountId?.message ? (
                <FieldError>{errors.accountId.message}</FieldError>
              ) : null}
            </Field>
          ) : null}
        </SummarySection>

        {!isEdit && cardType === "CREDIT" ? (
          <SummarySection title="Importe" icon={WalletIcon}>
            {balanceFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-3">
                <Controller
                  control={control}
                  name={`balances.${index}.creditLimit`}
                  render={({ field: limitField }) => (
                    <FinanceMoneyField
                      label="Límite"
                      amount={limitField.value}
                      onAmountChange={limitField.onChange}
                      onAmountCommit={(next) => {
                        limitField.onChange(next)
                        void trigger(`balances.${index}.creditLimit`)
                      }}
                      onAmountBlur={limitField.onBlur}
                      amountError={
                        errors.balances?.[index]?.creditLimit?.message
                      }
                      currency={
                        watchedBalances?.[index]?.currency ?? defaultCurrency
                      }
                      onCurrencyPress={() => {
                        setCurrencyRowIndex(index)
                        openPicker("currency")
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`balances.${index}.balance`}
                  render={({ field: balanceField }) => (
                    <FinanceMoneyField
                      label="Saldo al corte"
                      amount={balanceField.value}
                      onAmountChange={balanceField.onChange}
                      onAmountCommit={(next) => {
                        balanceField.onChange(next)
                        void trigger(`balances.${index}.balance`)
                      }}
                      onAmountBlur={balanceField.onBlur}
                      amountError={errors.balances?.[index]?.balance?.message}
                      currency={
                        watchedBalances?.[index]?.currency ?? defaultCurrency
                      }
                    />
                  )}
                />
                {balanceFields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeBalance(index)}
                  >
                    <TrashIcon className="size-4 shrink-0" />
                    Quitar moneda
                  </Button>
                ) : null}
              </div>
            ))}
            {canAddCurrency ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendBalance(
                    emptyBalanceRow(
                      nextUnusedCurrency(
                        (watchedBalances ?? []).map((row) => row.currency),
                        defaultCurrency,
                        financeConfig.trackedCurrencies
                      )
                    )
                  )
                }
              >
                <PlusIcon className="size-4 shrink-0" />
                Agregar moneda
              </Button>
            ) : null}
          </SummarySection>
        ) : null}

        {card && canManageCardBalances(card) && onUpdateBalance ? (
          <SummarySection title="Saldo" icon={WalletIcon}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onUpdateBalance(card)}
            >
              <RefreshCwIcon className="size-4 shrink-0" />
              Actualizar saldo
            </Button>
          </SummarySection>
        ) : null}

        {cardType === "CREDIT" ? (
          <SummarySection title="Ciclo" icon={CalendarDays}>
            <Controller
              control={control}
              name="statementClosingDay"
              render={({ field }) => (
                <FormTextField
                  icon={CalendarDays}
                  label="Día de corte"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.statementClosingDay?.message}
                  placeholder="15"
                />
              )}
            />
            <Controller
              control={control}
              name="paymentDueDay"
              render={({ field }) => (
                <FormTextField
                  icon={CalendarDays}
                  label="Día de pago"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.paymentDueDay?.message}
                  placeholder="25"
                />
              )}
            />
          </SummarySection>
        ) : null}

        {onReadStatement ? (
          <button
            type="button"
            onClick={onReadStatement}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
              PRESSABLE_CLASS
            )}
          >
            <FileTextIcon className="size-4.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                Leer de un estado de cuenta
              </span>
              <span className="block text-xs text-muted-foreground">
                PDF o correo del banco: rellena límite, saldo y fechas
              </span>
            </span>
          </button>
        ) : null}

        <SummarySection
          title="Detalles opcionales"
          icon={CircleAlert}
          collapsible
          defaultOpen={isEdit}
        >
          <Controller
            control={control}
            name="network"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Red"
                value={field.value === CATALOG_NONE ? "VISA" : field.value}
                onChange={field.onChange}
                options={NETWORK_OPTIONS}
              />
            )}
          />
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="card-color">Color</Label>
                <ColorPickerSwatch
                  id="card-color"
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </SummarySection>

        {!hasInstitutions ? (
          <p className="text-sm text-muted-foreground">
            Crea una institución en Productos antes de agregar una tarjeta.
          </p>
        ) : null}
      </FinanceFormScreen>

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={institutions}
        value={selectedInstitutionId}
        onSelect={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
      />

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
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

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={
          currencyRowIndex !== null
            ? (watchedBalances?.[currencyRowIndex]?.currency ?? defaultCurrency)
            : defaultCurrency
        }
        onSelect={(next) => {
          if (currencyRowIndex === null) {
            return
          }
          setValue(`balances.${currencyRowIndex}.currency`, next, {
            shouldValidate: true,
          })
        }}
      />
    </>
  )
}
