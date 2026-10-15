"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { HandCoinsIcon, SaveIcon, XIcon } from "lucide-react"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { useRecordSubscriptionPayment } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
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
  const { amountEntry, setAmountEntry } = useFinanceAmountEntry()
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
    try {
      await recordPayment.mutateAsync({
        amount: Number(values.amount.replace(",", ".")),
        paidAt: values.paidAt,
      })
      appToast.success({ text1: "Pago registrado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={recordPayment.isPending}
      title="Registrar pago"
      description="Queda en el historial y avanza el próximo cobro."
      actions={{
        close: (
          <Button
            key="cancel"
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
            key="submit"
            className="flex-1"
            disabled={recordPayment.isPending}
            onClick={onSubmit}
          >
            {recordPayment.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon className="size-4 shrink-0" />
            )}
            {recordPayment.isPending ? "Guardando..." : "Guardar"}
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
              amount={field.value}
              onAmountChange={field.onChange}
              onAmountCommit={field.onChange}
              amountError={errors.amount?.message}
              currency={subscription.currency}
              disabled={recordPayment.isPending}
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
