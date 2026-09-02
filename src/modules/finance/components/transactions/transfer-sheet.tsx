"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useCreateTransfer } from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  buildCreateTransferBody,
  buildLedgerTargetOptions,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import type { FinanceAccount, FinanceCard } from "@/src/modules/finance/types/entities"
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
import { ArrowLeftRightIcon, DollarSign } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  amount: z.string().trim().min(1, "Monto obligatorio"),
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  transactionDate: z.string().trim().min(1, "Fecha obligatoria"),
  fromTarget: z.string().min(1, "Elige origen"),
  toTarget: z.string().min(1, "Elige destino"),
  status: z.enum(["PENDING", "CONFIRMED"]),
  description: z.string(),
  notes: z.string(),
})

type FormValues = z.infer<typeof schema>

const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Completado" },
  { value: "PENDING", label: "Pendiente" },
]

function todayDateInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function currencyForTarget(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[],
  fallback: string,
): string {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  if (account?.currency) return account.currency
  const card = cards.find((item) => item.id === target.cardId)
  const cardCurrency = card?.balances[0]?.currency
  if (cardCurrency) return cardCurrency
  return fallback
}

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
    () => buildLedgerTargetOptions(accounts, cards),
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

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva transferencia"
      description={
        canTransfer
          ? "Se crean dos movimientos enlazados, uno de salida y otro de entrada."
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
      <SummarySection title="Transferencia" icon={ArrowLeftRightIcon}>
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
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FormTextField
              label="Monto"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="1.50"
            />
          )}
        />
        <Controller
          control={control}
          name="transactionDate"
          render={({ field }) => (
            <FormTextField
              label="Fecha"
              type="date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <SelectField
              label="Estado"
              value={field.value}
              onChange={field.onChange}
              options={STATUS_OPTIONS}
            />
          )}
        />
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
      </SummarySection>
      <SummarySection title="Moneda" icon={DollarSign}>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <CurrencySelectField
              value={field.value}
              onChange={field.onChange}
              enabled={open}
              extraCodes={[defaultCurrency]}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
