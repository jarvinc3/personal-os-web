"use client"

import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import type { FinanceMoneyFieldHandle } from "@/src/modules/finance/shared/components/forms/money-field"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCurrencyForTarget } from "@/src/modules/finance/shared/hooks/use-currency-for-target"
import { useExchangeRates } from "@/src/modules/finance/shared/hooks/use-exchange-rates"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateSavingsGoalContribution } from "@/src/modules/finance/shared/hooks/use-savings-goals"
import {
  useCreateTransfer,
  useUpdateTransfer,
} from "@/src/modules/finance/shared/hooks/use-transactions"
import {
  buildDestinationPickerGroups,
  ledgerTargetsFromGroups,
} from "@/src/modules/finance/shared/lib/destination-picker"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { wallClockToIso } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  buildCreateTransferBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { buildSavingsGoalContributionBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { TransferDetailsSection } from "@/src/modules/finance/transactions/components/transfer-details-section"
import {
  TransferFormSheets,
  type TransferFormPicker,
} from "@/src/modules/finance/transactions/components/transfer-form-sheets"
import { TransferImportSection } from "@/src/modules/finance/transactions/components/transfer-import-section"
import { TransferRouteSection } from "@/src/modules/finance/transactions/components/transfer-route-section"
import {
  crossExchangeRate,
  formatTransferRateInput,
  receivedFromRate,
} from "@/src/modules/finance/transactions/lib/transfer-fx"
import {
  transferSchema,
  type TransferFormValues,
} from "@/src/modules/finance/transactions/lib/transfer-form"
import { transferDefaults } from "@/src/modules/finance/transactions/lib/transfer-form-values"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

type GuidedStep = "from" | "to" | "amount" | "done"

type TransferFormProps = {
  defaultCurrency: string
  defaultAccountId?: string | null
  enabled: boolean
  display: FinanceMoneyDisplay
  transfer?: FinanceTransaction | null
  onDone: () => void
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
  const { picker, openPicker, closeHandlerFor } =
    usePicker<TransferFormPicker>("none")
  const timeZone = useUserTimeZone()
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
      transactionDate: wallClockToIso(values.transactionDate, timeZone),
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
          suggestGoalAllocation({
            goalId: createdTransfer.suggestGoalId,
            transferGroupId: createdTransfer.transferGroupId,
            payment: {
              amount: values.amount,
              transactionDate: values.transactionDate,
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

  function suggestGoalAllocation({
    goalId,
    transferGroupId,
    payment,
  }: {
    goalId: string
    transferGroupId: string
    payment: { amount: string; transactionDate: string }
  }) {
    appToast.success({
      text1: "Transferencia creada",
      text2: "¿Contar este movimiento como aporte a la meta?",
      duration: 8000,
      action: {
        label: "Contar como aporte",
        onClick: () => {
          const allocation = buildSavingsGoalContributionBody({
            amount: payment.amount,
            kind: "CONTRIBUTION",
            date: wallClockToIso(payment.transactionDate, timeZone),
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
  }

  const excludeTarget =
    picker === "to" ? fromTarget : picker === "from" ? toTarget : null

  return (
    <>
      <FinanceFormScreen
        onSubmit={onSubmit}
        submitLabel={isEdit ? "Guardar" : "Transferir"}
        isSubmitting={activeMutation.isPending}
        submitDisabled={!canSave}
      >
        <TransferRouteSection
          fromTarget={fromTarget}
          toTarget={toTarget}
          accounts={accounts}
          cards={cards}
          display={display}
          disabled={!canTransfer}
          destinationError={errors.toTarget?.message}
          onOpenFrom={() => openPicker("from")}
          onOpenTo={() => openPicker("to")}
        />

        <TransferImportSection
          form={{ control, errors }}
          amount={{
            currency,
            defaultCurrency,
            entryMode: amountEntry,
            onEntryModeChange: setAmountEntry,
            fieldRef: amountFieldRef,
            onCommit: () => void trigger("amount"),
            onCurrencyPress: () => openPicker("currency"),
          }}
          statusSwitchId={statusSwitchId}
          fx={{
            destinationCurrency: crossCurrency ? destinationCurrency : null,
            sourceCurrency,
            marketRate,
            receivedPreview,
            display,
            onRateChange: () => setRateTouched(true),
            onReceivedCommit: () => void trigger("receivedAmount"),
          }}
        />

        <TransferDetailsSection
          control={control}
          errors={errors}
          destinationPendingId={destinationPendingId}
        />

        {!canTransfer && targetsReady ? (
          <p className="text-sm text-muted-foreground">
            Necesitas una cuenta de origen y un destino distinto.
          </p>
        ) : null}
      </FinanceFormScreen>

      <TransferFormSheets
        picker={picker}
        closeHandlerFor={closeHandlerFor}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={display}
        currency={currency}
        defaultCurrency={defaultCurrency}
        excludeTarget={excludeTarget}
        onSelectTarget={(next) => {
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
        onSelectCurrency={(next) => setValue("currency", next)}
      />
    </>
  )
}
