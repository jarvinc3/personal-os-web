"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CurrencyPickerSheet } from "@/src/modules/finance/transactions/components/currency-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/transactions/components/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/transactions/components/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCurrencyForTarget } from "@/src/modules/finance/shared/hooks/use-currency-for-target"
import { useFinanceCurrencyChoices } from "@/src/modules/finance/shared/hooks/use-finance-currency-choices"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateTransfer } from "@/src/modules/finance/shared/hooks/use-transactions"
import {
  buildDestinationPickerGroups,
  ledgerTargetsFromGroups,
} from "@/src/modules/finance/shared/lib/destination-picker"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  nowDateTimeInput,
  wallClockToIso,
} from "@/src/modules/finance/shared/lib/ledger-form"
import {
  buildCreateTransferBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftRightIcon,
  ArrowUpDownIcon,
  FileTextIcon,
  InfoIcon,
  NotebookPenIcon,
} from "lucide-react"
import { useCallback, useEffect, useId, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  transferSchema,
  type TransferFormValues,
} from "@/src/modules/finance/transactions/lib/transfer-form"

type Picker = "none" | "from" | "to" | "currency"

type TransferFormProps = {
  defaultCurrency: string
  enabled: boolean
  display: FinanceMoneyDisplay
  onDone: () => void
}

export function TransferForm({
  defaultCurrency,
  enabled,
  display,
  onDone,
}: TransferFormProps) {
  const createMutation = useCreateTransfer()
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])
  const institutions = useMemo(
    () => institutionsQuery.data ?? [],
    [institutionsQuery.data]
  )
  const groups = useMemo(
    () => buildDestinationPickerGroups({ institutions, accounts, cards }),
    [institutions, accounts, cards]
  )
  const canTransfer =
    accounts.length >= 1 && accounts.length + cards.length >= 2
  const targetsReady =
    accountsQuery.isSuccess &&
    cardsQuery.isSuccess &&
    institutionsQuery.isSuccess
  const { picker, openPicker, closeHandlerFor } = usePicker<Picker>("none")
  const statusSwitchId = useId()

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TransferFormValues>({
    mode: "onTouched",
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      currency: defaultCurrency,
      transactionDate: nowDateTimeInput(),
      fromTarget: CATALOG_NONE,
      toTarget: CATALOG_NONE,
      status: "CONFIRMED",
      description: "",
      notes: "",
    },
  })

  const formValues = useWatch({ control })
  const formIsValid = transferSchema.safeParse(formValues).success
  const fromTarget = useWatch({ control, name: "fromTarget" })
  const toTarget = useWatch({ control, name: "toTarget" })
  const currency = useWatch({ control, name: "currency" })
  const {
    baseCurrency,
    codes: currencyCodes,
    quotes: currencyQuotes,
  } = useFinanceCurrencyChoices(currency || defaultCurrency)

  const canSave =
    !createMutation.isPending && targetsReady && canTransfer && formIsValid

  const applyTargetCurrency = useCallback(
    (next: string) => {
      setValue("currency", next)
    },
    [setValue]
  )

  useEffect(() => {
    if (!targetsReady) {
      return
    }
    const targets = ledgerTargetsFromGroups(groups)
    const accountTargets = accounts.map((account) =>
      encodeLedgerTarget("account", account.id)
    )
    const currentFrom = getValues("fromTarget")
    if (!splitLedgerTarget(currentFrom).accountId) {
      const nextFrom = accountTargets[0]
      if (nextFrom) {
        setValue("fromTarget", nextFrom, { shouldValidate: true })
      }
    }
    const currentTo = getValues("toTarget")
    if (
      !currentTo ||
      currentTo === CATALOG_NONE ||
      currentTo === getValues("fromTarget")
    ) {
      const from = getValues("fromTarget")
      const nextTo = targets.find((target) => target !== from)
      if (nextTo) {
        setValue("toTarget", nextTo, { shouldValidate: true })
      }
    }
  }, [accounts, getValues, groups, setValue, targetsReady])

  useCurrencyForTarget(
    fromTarget,
    accounts,
    cards,
    defaultCurrency,
    applyTargetCurrency
  )

  const onSubmit = handleSubmit(async (values) => {
    const from = splitLedgerTarget(values.fromTarget)
    const to = splitLedgerTarget(values.toTarget)
    const payload = buildCreateTransferBody({
      amount: values.amount,
      currency: values.currency,
      transactionDate: wallClockToIso(values.transactionDate),
      description: values.description,
      notes: values.notes,
      status: values.status,
      fromAccountId: from.accountId,
      toAccountId: to.accountId,
      toCardId: to.cardId,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await createMutation.mutateAsync(payload.body)
      appToast.success({ text1: "Transferencia creada" })
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel="Transferir"
        isSubmitting={createMutation.isPending}
        submitDisabled={!canSave}
      >
        <SummarySection title="Ruta" icon={ArrowLeftRightIcon}>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Origen
            </FieldLabel>
            <DestinationTrigger
              destination={fromTarget}
              accounts={accounts}
              cards={cards}
              display={display}
              disabled={!canTransfer}
              placeholder="Elige origen"
              onClick={() => openPicker("from")}
            />
          </Field>

          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Destino
            </FieldLabel>
            <DestinationTrigger
              destination={toTarget}
              accounts={accounts}
              cards={cards}
              display={display}
              disabled={!canTransfer}
              placeholder="Elige destino"
              onClick={() => openPicker("to")}
            />
            {errors.toTarget?.message ? (
              <FieldError>{errors.toTarget.message}</FieldError>
            ) : null}
          </Field>
        </SummarySection>

        <SummarySection title="Importe" icon={ArrowUpDownIcon}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <FinanceMoneyField
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("amount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.amount?.message}
                currency={currency || defaultCurrency}
                currencyError={errors.currency?.message}
                onCurrencyPress={() => openPicker("currency")}
              />
            )}
          />

          <Controller
            control={control}
            name="transactionDate"
            render={({ field }) => (
              <FinanceDateField
                label="Fecha y hora"
                value={field.value}
                onChange={field.onChange}
                error={errors.transactionDate?.message}
                withTime
                aside={
                  <Controller
                    control={control}
                    name="status"
                    render={({ field: statusField }) => (
                      <Field
                        orientation="horizontal"
                        className="h-11 w-auto shrink-0 gap-2 rounded-xl border border-border bg-card px-3"
                      >
                        <FieldLabel
                          htmlFor={statusSwitchId}
                          className="text-sm font-medium"
                        >
                          Completado
                        </FieldLabel>
                        <Switch
                          id={statusSwitchId}
                          checked={statusField.value === "CONFIRMED"}
                          onCheckedChange={(checked) =>
                            statusField.onChange(
                              checked ? "CONFIRMED" : "PENDING"
                            )
                          }
                        />
                      </Field>
                    )}
                  />
                }
              />
            )}
          />
        </SummarySection>

        <SummarySection title="Detalles opcionales" icon={InfoIcon} collapsible>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <FormTextField
                label="Descripción"
                icon={FileTextIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <FormTextField
                label="Notas"
                icon={NotebookPenIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </SummarySection>

        {!canTransfer && targetsReady ? (
          <p className="text-sm text-muted-foreground">
            Necesitas una cuenta de origen y un destino distinto.
          </p>
        ) : null}
      </FinanceFormScreen>

      <CurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        enabled={enabled}
        codes={currencyCodes}
        quotes={currencyQuotes}
        quoteCurrency={baseCurrency}
        showNames
        onSelect={(next) => setValue("currency", next)}
      />

      <DestinationPickerSheet
        open={picker === "from" || picker === "to"}
        onOpenChange={closeHandlerFor(picker === "to" ? "to" : "from")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        accountsOnly={picker === "from"}
        display={{ ...display, currency: currency || display.currency }}
        excludeTarget={
          picker === "to" ? fromTarget : picker === "from" ? toTarget : null
        }
        onSelect={(next) => {
          const field = picker === "to" ? "toTarget" : "fromTarget"
          const other = field === "toTarget" ? fromTarget : toTarget
          if (next === other) {
            return
          }
          setValue(field, next, { shouldValidate: true })
        }}
      />
    </>
  )
}
