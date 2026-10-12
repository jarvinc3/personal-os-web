"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceHelpText } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useRecordReceivablePayment } from "@/src/modules/finance/shared/hooks/use-receivables"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { buildReceivablePaymentBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import { HandshakeIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  receivablePaymentSchema,
  type ReceivablePaymentFormValues,
} from "@/src/modules/finance/receivables/lib/receivable-payment-form"

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
  currency?: string
  display: FinanceMoneyDisplay
  pending?: boolean
}

export function ReceivablePaymentSheet({
  open,
  onOpenChange,
  receivableId,
  debtorName,
  outstandingLabel,
  currency,
  display,
  pending = false,
}: ReceivablePaymentSheetProps) {
  const createMutation = useRecordReceivablePayment()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const activeAccounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive
  )
  const institutions = institutionsQuery.data ?? []
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "account">(
    "none"
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
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
    <>
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
              <FinanceMoneyField
                label="Monto"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("amount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.amount?.message}
                currency={currency}
              />
            )}
          />
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Cuenta donde entró el dinero
                </FieldLabel>
                <DestinationTrigger
                  destination={
                    field.value
                      ? encodeLedgerTarget("account", field.value)
                      : CATALOG_NONE
                  }
                  accounts={activeAccounts}
                  cards={[]}
                  display={display}
                  onClick={() => openPicker("account")}
                />
                {errors.accountId?.message ? (
                  <FieldError>{errors.accountId.message}</FieldError>
                ) : null}
              </Field>
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

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
        accounts={activeAccounts}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(next) =>
          setValue("accountId", splitLedgerTarget(next).accountId ?? "", {
            shouldValidate: true,
          })
        }
      />
    </>
  )
}
