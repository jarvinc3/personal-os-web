"use client"

import { FinanceCurrencyPills } from "@/src/modules/finance/components/forms/finance-currency-pills";
import {
  FinancePreviewRow,
  FinanceSegmentedControl,
} from "@/src/modules/finance/components/forms/finance-form-blocks";
import {
  CATALOG_NONE,
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_NETWORKS,
  FINANCE_CARD_TYPE_LABEL,
  FINANCE_CARD_TYPES,
} from "@/src/modules/finance/constants/catalog";
import {
  useArchiveCard,
  useCreateCard,
  useDeleteCard,
  useUpdateCard,
  useUpdateCardBalance,
} from "@/src/modules/finance/hooks/use-cards";
import {
  buildCardBalanceBodies,
  buildCreateCardBody,
  cardBalanceSaveMessage,
  nextUnusedCurrency,
} from "@/src/modules/finance/lib/catalog-payloads";
import { buildFinanceCurrencyOptions } from "@/src/modules/finance/lib/finance-currency";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/types/entities";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker";
import { Label } from "@/src/shared/components/ui/label";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArchiveIcon,
  Building2Icon,
  CalendarDays,
  CreditCardIcon,
  DollarSign,
  Palette,
  SaveIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const balanceRowSchema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z.string().trim(),
  creditLimit: z.string().trim(),
})

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  type: z.enum(FINANCE_CARD_TYPES),
  institutionId: z.string().min(1, "Institución obligatoria"),
  accountId: z.string(),
  network: z.string(),
  lastFour: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Deben ser 4 dígitos"),
  statementClosingDay: z.string().trim(),
  paymentDueDay: z.string().trim(),
  color: z.string().trim().max(20),
  balances: z.array(balanceRowSchema),
})

type FormValues = z.infer<typeof schema>

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

function toFormValues(
  card: FinanceCard | null,
  defaultCurrency: string,
  defaultInstitutionId: string
): FormValues {
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

type CardSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: FinanceCard | null
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  defaultCurrency: string
  defaultInstitutionId?: string
  onUpdateBalance: (card: FinanceCard) => void
  pending?: boolean
}

export function CardSheet({
  open,
  onOpenChange,
  card,
  institutions,
  accounts,
  defaultCurrency,
  defaultInstitutionId,
  onUpdateBalance,
  pending = false,
}: CardSheetProps) {
  const isEdit = Boolean(card)
  const createMutation = useCreateCard()
  const updateMutation = useUpdateCard()
  const archiveMutation = useArchiveCard()
  const deleteMutation = useDeleteCard()
  const balanceMutation = useUpdateCardBalance()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending ||
    balanceMutation.isPending

  const resolvedDefaultInstitutionId =
    defaultInstitutionId ?? institutions[0]?.id ?? ""

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(
      card,
      defaultCurrency,
      resolvedDefaultInstitutionId
    ),
  })

  const {
    fields: balanceFields,
    append: appendBalance,
    remove: removeBalance,
  } = useFieldArray({
    control,
    name: "balances",
  })

  const cardType = useWatch({ control, name: "type" })
  const selectedInstitutionId = useWatch({ control, name: "institutionId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const watchedBalances = useWatch({ control, name: "balances" })
  const cardName = useWatch({ control, name: "name" })
  const cardNetwork = useWatch({ control, name: "network" })
  const cardColor = useWatch({ control, name: "color" })
  const lastFour = useWatch({ control, name: "lastFour" })

  const institutionOptions = institutions.map((item) => ({
    value: item.id,
    label: item.name,
  }))
  const institutionAccounts = accounts.filter(
    (item) => item.isActive && item.institutionId === selectedInstitutionId
  )
  const accountOptions = [
    { value: CATALOG_NONE, label: "Sin cuenta" },
    ...institutionAccounts.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  ]
  const hasInstitutions = institutionOptions.length > 0
  const allowedCurrencies = buildFinanceCurrencyOptions(defaultCurrency)
  const usedCurrencies = (watchedBalances ?? []).map((row) => row.currency)
  const canAddCurrency = allowedCurrencies.some(
    (code) => !usedCurrencies.some((used) => used.toUpperCase() === code)
  )

  useEffect(() => {
    if (open) {
      reset(toFormValues(card, defaultCurrency, resolvedDefaultInstitutionId))
    }
  }, [open, card, defaultCurrency, resolvedDefaultInstitutionId, reset])

  useEffect(() => {
    if (
      selectedAccountId !== CATALOG_NONE &&
      !accounts.some(
        (item) =>
          item.id === selectedAccountId &&
          item.isActive &&
          item.institutionId === selectedInstitutionId
      )
    ) {
      setValue("accountId", CATALOG_NONE)
    }
  }, [accounts, selectedAccountId, selectedInstitutionId, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateCardBody(values, { isUpdate: isEdit })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }

    const balancesPayload = card
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
            await balanceMutation.mutateAsync({
              id: created.id,
              body,
            })
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
        appToast[message.kind]({
          text1: message.text1,
          text2: message.text2,
        })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onArchive() {
    if (!card) return
    try {
      await archiveMutation.mutateAsync(card.id)
      appToast.success({ text1: "Tarjeta archivada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDelete() {
    if (!card) return
    const confirmed = window.confirm(
      "¿Borrar esta tarjeta? Se eliminan sus movimientos. No se puede deshacer."
    )
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(card.id)
      appToast.success({ text1: "Tarjeta borrada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const networkLabel =
    cardNetwork && cardNetwork !== CATALOG_NONE
      ? (FINANCE_CARD_NETWORK_LABEL[
        cardNetwork as keyof typeof FINANCE_CARD_NETWORK_LABEL
      ] ?? cardNetwork)
      : "Sin red"

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={isEdit ? "Editar tarjeta" : "Nueva tarjeta"}
      description={
        hasInstitutions
          ? undefined
          : "Crea una institución en Cuentas antes de agregar una tarjeta."
      }
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={isPending || (!isEdit && !hasInstitutions)}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : <SaveIcon className="size-4 shrink-0" />}
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Vínculos" icon={Building2Icon}>
        <Controller
          control={control}
          name="institutionId"
          render={({ field }) => (
            <SelectField
              label="Institución"
              value={field.value || (institutionOptions[0]?.value ?? "")}
              onChange={field.onChange}
              options={
                hasInstitutions
                  ? institutionOptions
                  : [
                    {
                      value: CATALOG_NONE,
                      label: "Crea una institución primero",
                    },
                  ]
              }
              disabled={!hasInstitutions}
            />
          )}
        />
        {cardType === "DEBIT" ? (
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <SelectField
                label="Cuenta asociada"
                value={field.value}
                onChange={field.onChange}
                options={accountOptions}
              />
            )}
          />
        ) : null}
      </SummarySection>

      <SummarySection title="Tarjeta" icon={CreditCardIcon}>
        <FinancePreviewRow
          icon={CreditCardIcon}
          title={cardName.trim() || "Nueva tarjeta"}
          description={`${FINANCE_CARD_TYPE_LABEL[cardType]} · ${networkLabel}${lastFour ? ` · •••• ${lastFour}` : ""}`}
          accentColor={cardColor || undefined}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextField
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
          name="type"
          render={({ field }) => (
            <FinanceSegmentedControl
              label="Tipo"
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
            />
          )}
        />
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
          name="lastFour"
          render={({ field }) => (
            <FormTextField
              label="Últimos 4"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.lastFour?.message}
              placeholder="1234"
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Ciclo de facturación" icon={CalendarDays}>
        <Controller
          control={control}
          name="statementClosingDay"
          render={({ field }) => (
            <FormTextField
              label="Cierre de estado (día)"
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
              label="Vencimiento (día)"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.paymentDueDay?.message}
              placeholder="25"
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Apariencia" icon={Palette}>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-color">Color</Label>
              <ColorPickerSwatch
                id="card-color"
                variant="button"
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </SummarySection>

      {!isEdit ? (
        <SummarySection title="Saldos iniciales" icon={DollarSign}>
          {balanceFields.map((field, index) => {
            const usedByOthers = (watchedBalances ?? [])
              .map((row, rowIndex) => (rowIndex === index ? "" : row.currency))
              .filter(Boolean)
            return (
              <div key={field.id} className="flex flex-col gap-3">
                <Controller
                  control={control}
                  name={`balances.${index}.currency`}
                  render={({ field: currencyField }) => (
                    <FinanceCurrencyPills
                      label="Moneda"
                      value={currencyField.value}
                      onChange={currencyField.onChange}
                      baseCurrency={defaultCurrency}
                      extraCodes={[defaultCurrency, currencyField.value]}
                      excludeCodes={usedByOthers}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`balances.${index}.balance`}
                  render={({ field: balanceField }) => (
                    <FormTextField
                      label="Saldo"
                      value={balanceField.value}
                      onChange={balanceField.onChange}
                      onBlur={balanceField.onBlur}
                      placeholder="0.00"
                    />
                  )}
                />
                {cardType === "CREDIT" ? (
                  <Controller
                    control={control}
                    name={`balances.${index}.creditLimit`}
                    render={({ field: limitField }) => (
                      <FormTextField
                        label="Límite de crédito"
                        value={limitField.value}
                        onChange={limitField.onChange}
                        onBlur={limitField.onBlur}
                        placeholder="50000"
                      />
                    )}
                  />
                ) : null}
                {balanceFields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeBalance(index)}
                  >
                    Quitar moneda
                  </Button>
                ) : null}
              </div>
            )
          })}
          {canAddCurrency ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendBalance(
                  emptyBalanceRow(
                    nextUnusedCurrency(
                      (watchedBalances ?? []).map((row) => row.currency),
                      defaultCurrency
                    )
                  )
                )
              }
            >
              Agregar moneda
            </Button>
          ) : null}
        </SummarySection>
      ) : card ? (
        <SummarySection title="Saldo" icon={DollarSign}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onUpdateBalance(card)}
          >
            Actualizar saldo
          </Button>
        </SummarySection>
      ) : null}

      {isEdit && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-destructive"
            disabled={isPending}
            onClick={() => void onArchive()}
          >
            <ArchiveIcon className="size-4" />
            Archivar
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            className="flex-1"
            onClick={() => void onDelete()}
          >
            <TrashIcon className="size-4" />
            Borrar
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
