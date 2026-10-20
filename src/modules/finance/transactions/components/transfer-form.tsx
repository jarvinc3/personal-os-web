"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import type { FinanceMoneyFieldHandle } from "@/src/modules/finance/shared/components/forms/money-field"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useExchangeRates } from "@/src/modules/finance/shared/hooks/use-exchange-rates"
import { useCurrencyForTarget } from "@/src/modules/finance/shared/hooks/use-currency-for-target"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import {
  useCreateTransfer,
  useUpdateTransfer,
} from "@/src/modules/finance/shared/hooks/use-transactions"
import { useCreateSavingsGoalContribution } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import {
  buildDestinationPickerGroups,
  ledgerTargetsFromGroups,
} from "@/src/modules/finance/shared/lib/destination-picker"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  sliceDateTimeInput,
  wallClockToIso,
} from "@/src/modules/finance/shared/lib/ledger-form"
import {
  buildCreateTransferBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import { buildSavingsGoalContributionBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  sanitizeAmountInput,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  crossExchangeRate,
  formatTransferRateInput,
  receivedFromRate,
  transferRateLabel,
} from "@/src/modules/finance/transactions/lib/transfer-fx"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
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
  LandmarkIcon,
  NotebookPenIcon,
} from "lucide-react"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  transferSchema,
  type TransferFormValues,
} from "@/src/modules/finance/transactions/lib/transfer-form"

type Picker = "none" | "from" | "to" | "currency"
type GuidedStep = "from" | "to" | "amount" | "done"

type TransferFormProps = {
  defaultCurrency: string
  defaultAccountId?: string | null
  enabled: boolean
  display: FinanceMoneyDisplay
  transfer?: FinanceTransaction | null
  onDone: () => void
}

function transferDefaults(
  transfer: FinanceTransaction | null,
  defaultCurrency: string
) {
  return {
    amount: transfer?.amount ?? "",
    currency: transfer?.currency ?? defaultCurrency,
    transactionDate: sliceDateTimeInput(transfer?.transactionDate),
    fromTarget: transfer?.accountId
      ? encodeLedgerTarget("account", transfer.accountId)
      : transfer?.cardId
        ? encodeLedgerTarget("card", transfer.cardId)
        : CATALOG_NONE,
    toTarget: transfer?.transferToAccountId
      ? encodeLedgerTarget("account", transfer.transferToAccountId)
      : transfer?.transferToCardId
        ? encodeLedgerTarget("card", transfer.transferToCardId)
        : CATALOG_NONE,
    status:
      transfer?.status === "PENDING"
        ? ("PENDING" as const)
        : ("CONFIRMED" as const),
    destinationPending: false,
    rail: "" as const,
    feeAmount: "",
    exchangeRate:
      transfer && !transfer.transferEstimated
        ? (transfer.exchangeRate ?? "")
        : "",
    receivedAmount:
      transfer && !transfer.transferEstimated
        ? (transfer.transferToAmount ?? "")
        : "",
    description: transfer?.description ?? "",
    notes: transfer?.notes ?? "",
  }
}

export function TransferForm({
  defaultCurrency,
  defaultAccountId = null,
  enabled,
  display,
  transfer = null,
  onDone,
}: TransferFormProps) {
  const isEdit = Boolean(transfer)
  const createMutation = useCreateTransfer()
  const updateMutation = useUpdateTransfer()
  const addAllocation = useCreateSavingsGoalContribution()
  const activeMutation = isEdit ? updateMutation : createMutation
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
  const destinationPendingId = useId()
  const { amountEntry, setAmountEntry } = useFinanceAmountEntry()
  const [guidedStep, setGuidedStep] = useState<GuidedStep>(() =>
    isEdit ? "done" : "from"
  )
  const [rateTouched, setRateTouched] = useState(
    Boolean(isEdit && transfer && !transfer.transferEstimated)
  )
  const amountFieldRef = useRef<FinanceMoneyFieldHandle>(null)
  const guidedFromOpened = useRef(false)
  const guidedToOpened = useRef(false)

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
    defaultValues: transferDefaults(transfer, defaultCurrency),
  })

  const formValues = useWatch({ control })
  const formIsValid = transferSchema.safeParse(formValues).success
  const fromTarget = useWatch({ control, name: "fromTarget" })
  const toTarget = useWatch({ control, name: "toTarget" })
  const currency = useWatch({ control, name: "currency" })
  const toAccountId = splitLedgerTarget(toTarget).accountId
  const toCardId = splitLedgerTarget(toTarget).cardId
  const destinationCurrency =
    accounts.find((account) => account.id === toAccountId)?.currency ??
    cards.find((card) => card.id === toCardId)?.balances[0]?.currency ??
    null
  const sourceCurrency = (currency || defaultCurrency).toUpperCase()
  const crossCurrency = Boolean(
    destinationCurrency && destinationCurrency.toUpperCase() !== sourceCurrency
  )
  const rateQuotes =
    crossCurrency && destinationCurrency
      ? [sourceCurrency, destinationCurrency]
      : []
  const ratesQuery = useExchangeRates(display.currency, rateQuotes)
  const sourceRate = ratesQuery.data?.rates.find(
    (quote) => quote.currency === sourceCurrency
  )?.rate
  const destinationRate = destinationCurrency
    ? ratesQuery.data?.rates.find(
        (quote) => quote.currency === destinationCurrency.toUpperCase()
      )?.rate
    : null
  const marketRate = crossCurrency
    ? crossExchangeRate({ sourceRate, destinationRate })
    : null
  const previewRate = parseFinanceMoney(formValues.exchangeRate) ?? marketRate
  const receivedPreview =
    parseFinanceMoney(formValues.receivedAmount) ??
    receivedFromRate(formValues.amount, previewRate)
  const prefilledPair = useRef("")

  useEffect(() => {
    if (isEdit || !crossCurrency || marketRate === null) {
      return
    }
    const pairKey = `${sourceCurrency}:${destinationCurrency}`
    if (prefilledPair.current === pairKey) {
      return
    }
    prefilledPair.current = pairKey
    setValue("exchangeRate", formatTransferRateInput(marketRate), {
      shouldValidate: true,
    })
  }, [
    crossCurrency,
    destinationCurrency,
    isEdit,
    marketRate,
    setValue,
    sourceCurrency,
  ])

  const canSave =
    !activeMutation.isPending && targetsReady && canTransfer && formIsValid

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
      const preferredFrom = defaultAccountId
        ? encodeLedgerTarget("account", defaultAccountId)
        : null
      const nextFrom =
        preferredFrom && accountTargets.includes(preferredFrom)
          ? preferredFrom
          : accountTargets[0]
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
  }, [accounts, defaultAccountId, getValues, groups, setValue, targetsReady])

  useCurrencyForTarget(
    fromTarget,
    accounts,
    cards,
    defaultCurrency,
    applyTargetCurrency,
    !isEdit
  )

  useEffect(() => {
    if (isEdit || guidedStep !== "from" || guidedFromOpened.current) {
      return
    }
    guidedFromOpened.current = true
    openPicker("from")
  }, [isEdit, guidedStep, openPicker])

  useEffect(() => {
    if (isEdit || guidedStep !== "to" || guidedToOpened.current) {
      return
    }
    guidedToOpened.current = true
    openPicker("to")
  }, [isEdit, guidedStep, openPicker])

  function advanceToDestination() {
    if (isEdit || guidedStep !== "from") {
      return
    }
    setGuidedStep("to")
  }

  function advanceToAmount() {
    if (isEdit || guidedStep !== "to") {
      return
    }
    setGuidedStep("amount")
    window.setTimeout(() => amountFieldRef.current?.focusAmount(), 0)
  }

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
      rail: values.rail || undefined,
      feeAmount: values.feeAmount,
      destinationPending: values.destinationPending,
      exchangeRate:
        rateTouched || (isEdit && transfer?.transferEstimated === false)
          ? values.exchangeRate
          : undefined,
      receivedAmount: values.receivedAmount,
      fromAccountId: from.accountId,
      toAccountId: to.accountId,
      toCardId: to.cardId,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (transfer) {
        await updateMutation.mutateAsync({
          id: transfer.id,
          body: payload.body,
        })
        appToast.success({ text1: "Transferencia actualizada" })
      } else {
        const createdTransfer = await createMutation.mutateAsync(payload.body)
        if (createdTransfer.suggestGoalId) {
          const goalId = createdTransfer.suggestGoalId
          const transferGroupId = createdTransfer.transferGroupId
          appToast.success({
            text1: "Transferencia creada",
            text2: "¿Contar este movimiento como aporte a la meta?",
            duration: 8000,
            action: {
              label: "Contar como aporte",
              onClick: () => {
                const allocation = buildSavingsGoalContributionBody({
                  amount: values.amount,
                  kind: "CONTRIBUTION",
                  date: wallClockToIso(values.transactionDate),
                  fromTransferGroupId: transferGroupId,
                })
                if (!allocation.ok) {
                  appToast.error({ text1: allocation.error })
                  return
                }
                addAllocation.mutate(
                  { goalId, body: allocation.body },
                  {
                    onError: (error) =>
                      appToast.error({
                        text1: financeErrorMessage(error),
                      }),
                  }
                )
              },
            },
          })
        } else {
          appToast.success({ text1: "Transferencia creada" })
        }
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
        submitLabel={isEdit ? "Guardar" : "Transferir"}
        isSubmitting={activeMutation.isPending}
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
                entryMode={amountEntry}
                onEntryModeChange={setAmountEntry}
                fieldRef={amountFieldRef}
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

          {crossCurrency ? (
            <>
              <Controller
                control={control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormTextField
                    icon={ArrowUpDownIcon}
                    label="Tasa aplicada"
                    value={field.value}
                    onChange={(next) => {
                      setRateTouched(true)
                      field.onChange(sanitizeAmountInput(next))
                    }}
                    onBlur={field.onBlur}
                    error={errors.exchangeRate?.message}
                    placeholder={
                      marketRate === null
                        ? "Tasa del día"
                        : formatTransferRateInput(marketRate)
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name="receivedAmount"
                render={({ field }) => (
                  <FinanceMoneyField
                    label="Monto recibido"
                    amount={field.value}
                    onAmountChange={field.onChange}
                    onAmountCommit={(next) => {
                      field.onChange(next)
                      void trigger("receivedAmount")
                    }}
                    onAmountBlur={field.onBlur}
                    amountError={errors.receivedAmount?.message}
                    currency={destinationCurrency ?? currency}
                  />
                )}
              />
              <div className="flex flex-col gap-1 px-1 text-xs text-muted-foreground">
                <span>
                  {marketRate === null || !destinationCurrency
                    ? "Tasa del día no disponible. Escribe la tasa o el monto recibido."
                    : `Tasa del día: ${transferRateLabel({
                        rate: marketRate,
                        sourceCurrency,
                        destinationCurrency,
                      })}`}
                </span>
                {receivedPreview !== null && destinationCurrency ? (
                  <span>
                    Recibirás{" "}
                    {formatFinanceMoney(String(receivedPreview), {
                      ...display,
                      currency: destinationCurrency,
                    })}
                    .
                  </span>
                ) : null}
                <span>El monto recibido manda si escribes los dos.</span>
              </div>
            </>
          ) : null}
        </SummarySection>

        <SummarySection title="Detalles opcionales" icon={InfoIcon} collapsible>
          <Controller
            control={control}
            name="destinationPending"
            render={({ field }) => (
              <Field
                orientation="horizontal"
                className="justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
              >
                <FieldLabel
                  htmlFor={destinationPendingId}
                  className="text-sm font-medium"
                >
                  El destino aún no lo recibe
                </FieldLabel>
                <Switch
                  id={destinationPendingId}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="feeAmount"
            render={({ field }) => (
              <FormTextField
                label="Comisión (opcional)"
                icon={LandmarkIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.feeAmount?.message}
              />
            )}
          />
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

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={(next) => setValue("currency", next)}
      />

      <DestinationPickerSheet
        open={picker === "from" || picker === "to"}
        onOpenChange={closeHandlerFor(picker === "to" ? "to" : "from")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        accountsOnly={picker === "from" || picker === "to"}
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
          if (field === "fromTarget") {
            advanceToDestination()
            return
          }
          advanceToAmount()
        }}
      />
    </>
  )
}
