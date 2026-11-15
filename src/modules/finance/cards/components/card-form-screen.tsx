"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCwIcon, SaveIcon, WalletIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"

import { CardBalancesSection } from "@/src/modules/finance/cards/components/card-balances-section"
import {
  CardFormSheets,
  type CardFormPicker,
} from "@/src/modules/finance/cards/components/card-form-sheets"
import {
  CardCycleSection,
  CardOptionalDetailsSection,
} from "@/src/modules/finance/cards/components/card-form-sections"
import { CardIdentitySection } from "@/src/modules/finance/cards/components/card-identity-section"
import { CardVisual } from "@/src/modules/finance/cards/components/card-visual"
import {
  cardCreateBalanceRows,
  cardSchema,
  institutionAccountOptions,
  type CardFormValues,
} from "@/src/modules/finance/cards/lib/card-form"
import {
  emptyBalanceRow,
  toCardFormValues,
  type CardFormPrefill,
} from "@/src/modules/finance/cards/lib/card-form-values"
import { FinanceFormScreen } from "@/src/modules/finance/shared/components/forms/form-screen"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import {
  CATALOG_NONE,
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
  canManageCardBalances,
  type FinanceCardDisplayBalance,
} from "@/src/modules/finance/shared/lib/card-balances"
import {
  buildCardBalanceBodies,
  buildCreateCardBody,
  cardBalanceSaveMessage,
  nextUnusedCurrency,
} from "@/src/modules/finance/shared/lib/catalog-payloads"
import { buildFinanceCurrencyOptions } from "@/src/modules/finance/shared/lib/finance-currency"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"

const TYPE_OPTIONS = FINANCE_CARD_TYPES.map((value) => ({
  value,
  label: FINANCE_CARD_TYPE_LABEL[value],
}))

type CardFormScreenProps = {
  card?: FinanceCard | null
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  defaultCurrency: string
  defaultInstitutionId?: string
  /** Valores del correo para el alta desde una propuesta. */
  prefill?: CardFormPrefill
  display: FinanceMoneyDisplay
  onDone: () => void
  /** Alta desde una propuesta: entrega la tarjeta creada. */
  onCreated?: (card: FinanceCard) => void
  /** Institución elegida fuera del formulario; se sincroniza sin reiniciarlo. */
  selectedInstitutionId?: string
  onUpdateBalance?: (card: FinanceCard) => void
}

export function CardFormScreen({
  card = null,
  institutions,
  accounts,
  defaultCurrency,
  defaultInstitutionId,
  prefill = {},
  display,
  onDone,
  onCreated,
  onUpdateBalance,
  selectedInstitutionId: chosenInstitutionId,
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
    defaultValues: toCardFormValues({
      card,
      defaultCurrency,
      defaultInstitutionId: resolvedDefaultInstitutionId,
      prefill,
    }),
  })

  const {
    fields: balanceFields,
    append: appendBalance,
    remove: removeBalance,
  } = useFieldArray({ control, name: "balances" })

  const cardType = useWatch({ control, name: "type" })
  const formInstitutionId = useWatch({ control, name: "institutionId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const watchedBalances = useWatch({ control, name: "balances" })
  const cardName = useWatch({ control, name: "name" })
  const cardNetwork = useWatch({ control, name: "network" })
  const cardColor = useWatch({ control, name: "color" })
  const lastFour = useWatch({ control, name: "lastFour" })
  const selectedInstitution =
    institutions.find((item) => item.id === formInstitutionId) ?? null
  const institutionAccounts = institutionAccountOptions(
    accounts,
    formInstitutionId
  )
  const hasInstitutions = institutions.length > 0
  const { picker, openPicker, closeHandlerFor } =
    usePicker<CardFormPicker>("none")
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
      formInstitutionId
    ).some((account) => account.id === selectedAccountId)
    if (!accountIsOffered) {
      setValue("accountId", CATALOG_NONE)
    }
  }, [accounts, selectedAccountId, formInstitutionId, setValue])

  useEffect(() => {
    if (!chosenInstitutionId || chosenInstitutionId === formInstitutionId) {
      return
    }
    setValue("institutionId", chosenInstitutionId, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue("accountId", CATALOG_NONE, { shouldValidate: true })
  }, [chosenInstitutionId, formInstitutionId, setValue])

  const previewBalance = watchedBalances?.[0]
  const previewCurrency = previewBalance?.currency ?? defaultCurrency
  const previewAmount = parseFinanceMoney(previewBalance?.balance ?? null)
  const previewLimit = parseFinanceMoney(previewBalance?.creditLimit ?? null)
  const previewValue =
    cardType === "CREDIT"
      ? Math.max(0, (previewLimit ?? 0) - (previewAmount ?? 0))
      : (previewAmount ?? 0)
  const previewNetwork =
    FINANCE_CARD_NETWORKS.find((network) => network === cardNetwork) ?? null
  const previewCard: FinanceCard = {
    id: card?.id ?? "preview",
    institutionId: selectedInstitution?.id ?? "",
    institutionName: selectedInstitution?.name ?? "",
    institutionLogoUrl: selectedInstitution?.logoUrl ?? null,
    accountId:
      selectedAccountId && selectedAccountId !== CATALOG_NONE
        ? selectedAccountId
        : null,
    accountName: null,
    name: cardName.trim() || "Nueva tarjeta",
    type: cardType,
    network: previewNetwork,
    lastFour: lastFour || null,
    statementClosingDay: null,
    paymentDueDay: null,
    nextStatementDate: null,
    nextPaymentDueDate: null,
    color: cardColor || null,
    isActive: true,
    balances: [],
  }
  const previewBalances: FinanceCardDisplayBalance[] = previewBalance
    ? [
        {
          id: "preview",
          currency: previewCurrency,
          balance: String(previewValue),
          availableCredit: cardType === "CREDIT" ? String(previewValue) : null,
          creditLimit: previewLimit === null ? null : String(previewLimit),
        },
      ]
    : []

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildCreateCardBody(values, { isUpdate: isEdit })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    const balancesPayload =
      card || values.type === "DEBIT"
        ? { ok: true as const, body: [] }
        : buildCardBalanceBodies(cardCreateBalanceRows(values), {
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
        if (onCreated) {
          onCreated(created)
          return
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
        submitLabel={isEdit ? "Guardar" : "Crear tarjeta"}
        submitIcon={SaveIcon}
        isSubmitting={isPending}
        submitDisabled={!canSave}
      >
        <CardVisual
          card={previewCard}
          balances={previewBalances}
          display={display}
        />

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
              size="lg"
              fullWidth
            />
          )}
        />

        <CardIdentitySection
          control={control}
          errors={errors}
          cardType={cardType}
          selectedInstitution={selectedInstitution}
          hasInstitutions={hasInstitutions}
          institutionAccounts={institutionAccounts}
          selectedAccountId={selectedAccountId}
          display={display}
          onOpenInstitution={() => openPicker("institution")}
          onOpenAccount={() => openPicker("account")}
        />

        {!isEdit && cardType === "CREDIT" ? (
          <CardBalancesSection
            form={{ control, errors, onTrigger: trigger }}
            balances={{
              rows: balanceFields,
              values: watchedBalances ?? [],
              defaultCurrency,
            }}
            canAddCurrency={canAddCurrency}
            actions={{
              onRemoveRow: removeBalance,
              onAddCurrency: () =>
                appendBalance(
                  emptyBalanceRow(
                    nextUnusedCurrency(
                      (watchedBalances ?? []).map((row) => row.currency),
                      defaultCurrency,
                      financeConfig.trackedCurrencies
                    )
                  )
                ),
              onOpenCurrency: (index) => {
                setCurrencyRowIndex(index)
                openPicker("currency")
              },
            }}
          />
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
          <CardCycleSection control={control} errors={errors} />
        ) : null}

        <CardOptionalDetailsSection control={control} openByDefault={isEdit} />

        {!hasInstitutions ? (
          <p className="text-sm text-muted-foreground">
            Crea una institución en Productos antes de agregar una tarjeta.
          </p>
        ) : null}
      </FinanceFormScreen>

      <CardFormSheets
        picker={picker}
        closeHandlerFor={closeHandlerFor}
        institutions={institutions}
        institutionAccounts={institutionAccounts}
        display={display}
        selectedInstitutionId={formInstitutionId}
        defaultCurrency={defaultCurrency}
        currencyRowValue={
          currencyRowIndex !== null
            ? (watchedBalances?.[currencyRowIndex]?.currency ?? defaultCurrency)
            : defaultCurrency
        }
        onSelectInstitution={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
        onSelectAccount={(next) =>
          setValue("accountId", next, { shouldValidate: true })
        }
        onSelectCurrency={(next) => {
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
