"use client"

import { ledgerTargetSelectOptions } from "@/src/modules/finance/components/ledger-target-select"
import { FinanceCurrencyPills } from "@/src/modules/finance/components/forms/finance-currency-pills"
import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field"
import {
  FinanceAmountField,
  FinanceDetailsDisclosure,
  FinanceHelpText,
  FinancePreviewRow,
  FinanceSegmentedControl,
} from "@/src/modules/finance/components/forms/finance-form-blocks"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useCreateTransfer } from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  currencyForTarget,
  ledgerTargetLabel,
  todayDateInput,
} from "@/src/modules/finance/lib/ledger-form"
import {
  buildCreateTransferBody,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import type { FinanceAccount, FinanceCard } from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftRightIcon, ArrowRightIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z
  .object({
    amount: z.string().trim().min(1, "Monto obligatorio"),
    currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
    transactionDate: z.string().trim().min(1, "Fecha obligatoria"),
    fromTarget: z.string().min(1, "Elige origen"),
    toTarget: z.string().min(1, "Elige destino"),
    status: z.enum(["PENDING", "CONFIRMED"]),
    description: z.string(),
    notes: z.string(),
  })
  .refine((values) => values.fromTarget !== values.toTarget, {
    path: ["toTarget"],
    message: "Origen y destino tienen que ser distintos",
  })

type FormValues = z.infer<typeof schema>

const STATUS_OPTIONS = [
  { value: "CONFIRMED" as const, label: "Completado" },
  { value: "PENDING" as const, label: "Pendiente" },
]

type TransferSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  defaultCurrency: string
}

export function TransferSheet({
  open,
  onOpenChange,
  accounts,
  cards,
  defaultCurrency,
}: TransferSheetProps) {
  const createMutation = useCreateTransfer()
  const destinationOptions = useMemo(
    () => ledgerTargetSelectOptions(accounts, cards),
    [accounts, cards],
  )
  const fromDefault = destinationOptions[1]?.value ?? CATALOG_NONE
  const toDefault = destinationOptions[2]?.value ?? destinationOptions[1]?.value ?? CATALOG_NONE
  const canTransfer = accounts.length + cards.length >= 2

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      currency: defaultCurrency,
      transactionDate: todayDateInput(),
      fromTarget: fromDefault,
      toTarget: toDefault,
      status: "CONFIRMED",
      description: "",
      notes: "",
    },
  })

  const fromTarget = useWatch({ control, name: "fromTarget" })
  const toTarget = useWatch({ control, name: "toTarget" })

  useEffect(() => {
    if (open) {
      reset({
        amount: "",
        currency: defaultCurrency,
        transactionDate: todayDateInput(),
        fromTarget: fromDefault,
        toTarget: toDefault,
        status: "CONFIRMED",
        description: "",
        notes: "",
      })
    }
  }, [open, defaultCurrency, fromDefault, toDefault, reset])

  useEffect(() => {
    if (!open) return
    setValue(
      "currency",
      currencyForTarget(fromTarget, accounts, cards, defaultCurrency),
    )
  }, [open, fromTarget, accounts, cards, defaultCurrency, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const from = splitLedgerTarget(values.fromTarget)
    const to = splitLedgerTarget(values.toTarget)
    const payload = buildCreateTransferBody({
      amount: values.amount,
      currency: values.currency,
      transactionDate: values.transactionDate,
      description: values.description,
      notes: values.notes,
      status: values.status,
      fromAccountId: from.accountId,
      fromCardId: from.cardId,
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
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  const fromLabel = ledgerTargetLabel(fromTarget, accounts, cards)
  const toLabel = ledgerTargetLabel(toTarget, accounts, cards)

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva transferencia"
      description={
        canTransfer
          ? "Mueve dinero entre dos cuentas o tarjetas. Se crean dos movimientos enlazados."
          : "Necesitas al menos dos cuentas o tarjetas distintas."
      }
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            type="button"
            disabled={createMutation.isPending || !canTransfer}
            className="flex-1"
            onClick={onSubmit}
          >
            {createMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Transferir
          </Button>
        ),
      }}
    >
      <SummarySection title="Ruta" icon={ArrowLeftRightIcon}>
        <Controller
          control={control}
          name="fromTarget"
          render={({ field }) => (
            <SelectField
              label="Origen"
              value={field.value}
              onChange={field.onChange}
              options={destinationOptions}
              disabled={!canTransfer}
            />
          )}
        />
        <Controller
          control={control}
          name="toTarget"
          render={({ field }) => (
            <SelectField
              label="Destino"
              value={field.value}
              onChange={field.onChange}
              options={destinationOptions}
              disabled={!canTransfer}
            />
          )}
        />
        {errors.toTarget?.message ? (
          <p className="text-sm text-destructive">{errors.toTarget.message}</p>
        ) : null}
        {fromLabel && toLabel ? (
          <FinancePreviewRow
            icon={ArrowRightIcon}
            title={`${fromLabel} → ${toLabel}`}
            description="Salida y entrada enlazadas"
          />
        ) : (
          <FinanceHelpText>
            Elige origen y destino distintos para ver el resumen.
          </FinanceHelpText>
        )}
      </SummarySection>

      <SummarySection title="Importe" icon={ArrowLeftRightIcon}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FinanceAmountField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <FinanceCurrencyPills
              value={field.value}
              onChange={field.onChange}
              baseCurrency={defaultCurrency}
              extraCodes={[defaultCurrency]}
            />
          )}
        />
        <Controller
          control={control}
          name="transactionDate"
          render={({ field }) => (
            <FinanceDateField
              label="Fecha"
              value={field.value}
              onChange={field.onChange}
              error={errors.transactionDate?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <FinanceSegmentedControl
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              options={STATUS_OPTIONS}
            />
          )}
        />
      </SummarySection>

      <FinanceDetailsDisclosure>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormTextField
              label="Descripción"
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
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </FinanceDetailsDisclosure>
    </BottomSheet>
  )
}
