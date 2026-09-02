"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import {
  CATALOG_NONE,
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_NETWORKS,
  FINANCE_CARD_TYPE_LABEL,
  FINANCE_CARD_TYPES,
} from "@/src/modules/finance/constants/catalog"
import {
  useArchiveCard,
  useCreateCard,
  useUpdateCard,
  useUpdateCardBalance,
} from "@/src/modules/finance/hooks/use-cards"
import {
  buildCardBalanceBody,
  buildCreateCardBody,
} from "@/src/modules/finance/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2Icon,
  CalendarDays,
  CreditCardIcon,
  DollarSign,
  Palette,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  type: z.enum(FINANCE_CARD_TYPES),
  institutionId: z.string().min(1, "Institución obligatoria"),
  accountId: z.string(),
  network: z.string(),
  lastFour: z.string().trim().max(4),
  statementClosingDay: z.string().trim(),
  paymentDueDay: z.string().trim(),
  color: z.string().trim().max(20),
  balance: z.string().trim(),
  creditLimit: z.string().trim(),
  balanceCurrency: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

const TYPE_OPTIONS = FINANCE_CARD_TYPES.map((value) => ({
  value,
  label: FINANCE_CARD_TYPE_LABEL[value],
}))

const NETWORK_OPTIONS = [
  { value: CATALOG_NONE, label: "Sin red" },
  ...FINANCE_CARD_NETWORKS.map((value) => ({
    value,
    label: FINANCE_CARD_NETWORK_LABEL[value],
  })),
]

function toFormValues(
  card: FinanceCard | null,
  defaultCurrency: string,
  defaultInstitutionId: string,
): FormValues {
  const primary = card?.balances[0]
  return {
    name: card?.name ?? "",
    type: card?.type ?? "CREDIT",
    institutionId: card?.institutionId ?? defaultInstitutionId,
    accountId: card?.accountId ?? CATALOG_NONE,
    network: card?.network ?? CATALOG_NONE,
    lastFour: card?.lastFour ?? "",
    statementClosingDay: card?.statementClosingDay
      ? String(card.statementClosingDay)
      : "",
    paymentDueDay: card?.paymentDueDay ? String(card.paymentDueDay) : "",
    color: card?.color ?? "",
    balance: "",
    creditLimit: "",
    balanceCurrency: primary?.currency ?? defaultCurrency,
  }
}

type CardSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: FinanceCard | null
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  defaultCurrency: string
  onUpdateBalance: (card: FinanceCard) => void
}

export function CardSheet({
  open,
  onOpenChange,
  card,
  institutions,
  accounts,
  defaultCurrency,
  onUpdateBalance,
}: CardSheetProps) {
  const isEdit = Boolean(card)
  const createMutation = useCreateCard()
  const updateMutation = useUpdateCard()
  const archiveMutation = useArchiveCard()
  const balanceMutation = useUpdateCardBalance()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    balanceMutation.isPending

  const institutionOptions = institutions.map((item) => ({
    value: item.id,
    label: item.name,
  }))
  const accountOptions = [
    { value: CATALOG_NONE, label: "Sin cuenta" },
    ...accounts.map((item) => ({ value: item.id, label: item.name })),
  ]
  const hasInstitutions = institutionOptions.length > 0

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(card, defaultCurrency, institutions[0]?.id ?? ""),
  })

  const cardType = useWatch({ control, name: "type" })

  useEffect(() => {
    if (open) {
      reset(toFormValues(card, defaultCurrency, institutions[0]?.id ?? ""))
    }
  }, [open, card, defaultCurrency, institutions, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateCardBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }

    const wantsBalance =
      values.balance.trim() !== "" || values.creditLimit.trim() !== ""
    let balanceBody = null
    if (wantsBalance) {
      const parsed = buildCardBalanceBody({
        currency: values.balanceCurrency || defaultCurrency,
        balance: values.balance.trim() === "" ? "0" : values.balance,
        creditLimit: values.creditLimit,
      })
      if (!parsed.ok) {
        appToast.error({ text1: parsed.error })
        return
      }
      balanceBody = parsed.body
    }

    try {
      if (card) {
        await updateMutation.mutateAsync({ id: card.id, body: payload.body })
        appToast.success({ text1: "Tarjeta actualizada" })
      } else {
        const created = await createMutation.mutateAsync(payload.body)
        if (balanceBody) {
          await balanceMutation.mutateAsync({
            id: created.id,
            body: balanceBody,
          })
        }
        appToast.success({ text1: "Tarjeta creada" })
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

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar tarjeta" : "Nueva tarjeta"}
      description={
        hasInstitutions
          ? undefined
          : "Crea una institución en Cuentas antes de agregar una tarjeta."
      }
      actions={{
        delete: isEdit ? (
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => void onArchive()}
          >
            Archivar
          </Button>
        ) : undefined,
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={isPending || (!isEdit && !hasInstitutions)}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
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
                  : [{ value: CATALOG_NONE, label: "Crea una institución primero" }]
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
            <SelectField
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
            <SelectField
              label="Red"
              value={field.value}
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
            <FormTextField
              label="Color"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.color?.message}
              placeholder="#22c55e"
            />
          )}
        />
      </SummarySection>

      {!isEdit ? (
        <SummarySection title="Saldo inicial" icon={DollarSign}>
          <Controller
            control={control}
            name="balanceCurrency"
            render={({ field }) => (
              <CurrencySelectField
                label="Moneda"
                value={field.value}
                onChange={field.onChange}
                enabled={open}
                extraCodes={[defaultCurrency]}
              />
            )}
          />
          <Controller
            control={control}
            name="balance"
            render={({ field }) => (
              <FormTextField
                label="Saldo"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="0.00"
              />
            )}
          />
          {cardType === "CREDIT" ? (
            <Controller
              control={control}
              name="creditLimit"
              render={({ field }) => (
                <FormTextField
                  label="Límite de crédito"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="50000"
                />
              )}
            />
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
    </BottomSheet>
  )
}
