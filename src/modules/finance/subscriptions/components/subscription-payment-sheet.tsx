"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { HandCoinsIcon, SaveIcon } from "lucide-react"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { useRecordSubscriptionPayment } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import {
  useCreateTransaction,
  useDeleteTransaction,
} from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { buildCreateTransactionBody } from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  todayDateInput,
  wallClockToIso,
} from "@/src/modules/finance/shared/lib/ledger-form"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"

const paymentFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .refine((value) => Number(value.replace(",", ".")) > 0, {
      message: "Monto mayor que cero",
    }),
  paidAt: z.string().min(1, "Fecha obligatoria"),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

type SubscriptionPaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: FinanceSubscription
}

export function SubscriptionPaymentSheet({
  open,
  onOpenChange,
  subscription,
}: SubscriptionPaymentSheetProps) {
  const recordPayment = useRecordSubscriptionPayment(subscription.id)
  const createExpense = useCreateTransaction()
  const deleteExpense = useDeleteTransaction()
  const saving =
    recordPayment.isPending ||
    createExpense.isPending ||
    deleteExpense.isPending
  const paymentTarget = subscription.paymentMethod
    ? subscription.paymentMethod.type === "CARD"
      ? { cardId: subscription.paymentMethod.id }
      : { accountId: subscription.paymentMethod.id }
    : subscription.cardId
      ? { cardId: subscription.cardId }
      : subscription.accountId
        ? { accountId: subscription.accountId }
        : null
  const paymentTargetName =
    subscription.paymentMethod?.name ??
    subscription.cardName ??
    subscription.accountName
  const { amountEntry, setAmountEntry } = useFinanceAmountEntry()
  const timeZone = useUserTimeZone()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    values: {
      amount: subscription.amount,
      paidAt: todayDateInput(),
    },
  })

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const amount = Number(values.amount.replace(",", "."))
    if (!paymentTarget) {
      appToast.error({
        text1:
          "Asigna una cuenta o tarjeta a la suscripción antes de registrar el pago.",
      })
      return
    }
    const expense = buildCreateTransactionBody({
      ...paymentTarget,
      type: "DEBIT",
      amount: String(amount),
      currency: subscription.currency,
      transactionDate: wallClockToIso(`${values.paidAt}T12:00`, timeZone),
      description: `Suscripción: ${subscription.name}`,
      categoryId: subscription.categoryId ?? undefined,
    })
    if (!expense.ok) {
      appToast.error({ text1: expense.error })
      return
    }

    try {
      const created = await createExpense.mutateAsync(expense.body)
      try {
        await recordPayment.mutateAsync({
          amount,
          paidAt: values.paidAt,
          transactionId: created.id,
        })
      } catch (error) {
        try {
          await deleteExpense.mutateAsync(created.id)
        } catch (rollbackError) {
          void rollbackError
          appToast.error({
            text1:
              "El gasto quedó registrado, pero no se pudo vincular a la suscripción.",
          })
        }
        throw error
      }
      appToast.success({ text1: "Pago registrado y gasto creado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      helpAction={
        <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.subscriptionPayment} />
      }
      pending={saving}
      title="Registrar pago"
      description={
        paymentTargetName
          ? `Crea el gasto en ${paymentTargetName} y avanza el próximo cobro.`
          : "Asigna una cuenta o tarjeta a la suscripción para registrar el pago."
      }
      actions={{
        submit: (
          <Button
            key="submit"
            className="flex-1"
            disabled={saving || !paymentTarget}
            onClick={onSubmit}
          >
            {saving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon className="size-4 shrink-0" />
            )}
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Pago" icon={HandCoinsIcon}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FinanceMoneyField
              calculatorKey="subscription-payment-amount"
              amount={field.value}
              onAmountChange={field.onChange}
              onAmountCommit={field.onChange}
              amountError={errors.amount?.message}
              currency={subscription.currency}
              disabled={saving}
              entryMode={amountEntry}
              onEntryModeChange={setAmountEntry}
            />
          )}
        />
        <Controller
          control={control}
          name="paidAt"
          render={({ field }) => (
            <FinanceDateField
              label="Fecha del pago"
              value={field.value}
              onChange={field.onChange}
              error={errors.paidAt?.message}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
