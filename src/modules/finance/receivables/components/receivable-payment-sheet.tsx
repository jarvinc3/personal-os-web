"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceAmountField,
  FinanceHelpText,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useRecordReceivablePayment } from "@/src/modules/finance/shared/hooks/use-receivables"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { buildReceivablePaymentBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { SelectField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { HandshakeIcon, WalletIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  receivablePaymentSchema,
  type ReceivablePaymentFormValues,
} from "@/src/modules/finance/planning/lib/receivable-payment-form"

const EMPTY_FORM: ReceivablePaymentFormValues = {
  amount: "",
  accountId: "",
  paidAt: "",
}

type ReceivablePaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receivableId: string | null
  debtorName?: string
  outstandingLabel?: string
  pending?: boolean
}

export function ReceivablePaymentSheet({
  open,
  onOpenChange,
  receivableId,
  debtorName,
  outstandingLabel,
  pending = false,
}: ReceivablePaymentSheetProps) {
  const createMutation = useRecordReceivablePayment()
  const accountsQuery = useAccounts(open)
  const accountOptions = (accountsQuery.data ?? [])
    .filter((account) => account.isActive)
    .map((account) => ({ value: account.id, label: account.name }))

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceivablePaymentFormValues>({
    resolver: zodResolver(receivablePaymentSchema),
    defaultValues: EMPTY_FORM,
  })

  useEffect(() => {
    if (open) {
      reset(EMPTY_FORM)
    }
  }, [open, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!receivableId) {
      return
    }
    const payload = buildReceivablePaymentBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await createMutation.mutateAsync({
        receivableId,
        body: payload.body,
      })
      appToast.success({ text1: "Cobro registrado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title="Registrar cobro"
      description={
        debtorName ? `Entra dinero de ${debtorName} a la cuenta.` : undefined
      }
      actions={{
        close: (
          <Button
            type="button"
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
            type="button"
            disabled={createMutation.isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {createMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Registrar
          </Button>
        ),
      }}
    >
      <SummarySection title="Cobro" icon={HandshakeIcon}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FinanceAmountField
              label="Monto"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.amount?.message}
              placeholder="5000"
            />
          )}
        />
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <SelectField
              icon={WalletIcon}
              label="Cuenta donde entró el dinero"
              value={field.value}
              onChange={field.onChange}
              options={accountOptions}
            />
          )}
        />
        <Controller
          control={control}
          name="paidAt"
          render={({ field }) => (
            <FinanceDateField
              label="Fecha"
              value={field.value}
              onChange={field.onChange}
              optional
            />
          )}
        />
        <FinanceHelpText>
          {outstandingLabel
            ? `Queda por cobrar ${outstandingLabel}. El cobro crea un ingreso en la cuenta elegida.`
            : "El cobro crea un ingreso en la cuenta elegida."}
        </FinanceHelpText>
      </SummarySection>
    </BottomSheet>
  )
}
