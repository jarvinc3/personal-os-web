"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceHelpText } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import {
  useReceivables,
  useRecordReceivablePayment,
} from "@/src/modules/finance/shared/hooks/use-receivables"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { buildReceivablePaymentBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { receivableTargets } from "@/src/modules/finance/receivables/lib/receivable-targets"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CoinsIcon,
  DivideIcon,
  HandCoinsIcon,
  HandshakeIcon,
  TrendingUpIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  receivablePaymentSchema,
  type ReceivablePaymentFormValues,
} from "@/src/modules/finance/receivables/lib/receivable-payment-form"

const EMPTY_FORM: ReceivablePaymentFormValues = {
  amount: "",
  accountId: "",
  paidAt: "",
}

const EXCESS_OPTIONS = [
  { value: "EXTRA_INCOME", label: "Ingreso extra", icon: TrendingUpIcon },
  { value: "CREDIT_BALANCE", label: "Saldo a favor", icon: WalletIcon },
  { value: "APPLY_TO_RECEIVABLE", label: "A otro cobro", icon: HandCoinsIcon },
] as const

type ReceivablePaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receivableId: string | null
  debtorName?: string
  outstandingLabel?: string
  outstanding?: number
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
  outstanding,
  currency,
  display,
  pending = false,
}: ReceivablePaymentSheetProps) {
  const createMutation = useRecordReceivablePayment()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const receivablesQuery = useReceivables(open)
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
    formState: { errors, isDirty },
  } = useForm<ReceivablePaymentFormValues>({
    resolver: zodResolver(receivablePaymentSchema),
    defaultValues: EMPTY_FORM,
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })

  const amount = useWatch({ control, name: "amount" })
  const parsedAmount = parseFinanceMoney(amount)
  const exceedsOutstanding =
    outstanding !== undefined &&
    parsedAmount !== null &&
    parsedAmount > outstanding
  const [excessHandling, setExcessHandling] = useState<
    "EXTRA_INCOME" | "CREDIT_BALANCE" | "APPLY_TO_RECEIVABLE" | null
  >(null)
  const [targetReceivableId, setTargetReceivableId] = useState<string | null>(
    null
  )
  const targetOptions = receivableTargets({
    receivables: receivablesQuery.data ?? [],
    excludeId: receivableId,
    currency,
  })
  const excessOptions = EXCESS_OPTIONS.filter(
    (option) =>
      option.value !== "APPLY_TO_RECEIVABLE" || targetOptions.length > 0
  )
  const targetMissing =
    excessHandling === "APPLY_TO_RECEIVABLE" && targetReceivableId === null
  const excessAmount =
    parsedAmount !== null && outstanding !== undefined
      ? parsedAmount - outstanding
      : 0
  const amountError = errors.amount?.message
  const receivableDisplay = {
    ...display,
    currency: currency ?? display.currency,
  }

  function clearExcessChoice() {
    setExcessHandling(null)
    setTargetReceivableId(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      clearExcessChoice()
    }
    requestOpenChange(next)
  }

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_FORM, paidAt: todayDateInput() })
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
    const payload = buildReceivablePaymentBody({
      ...values,
      ...(excessHandling ? { excessHandling } : {}),
      ...(excessHandling === "APPLY_TO_RECEIVABLE" && targetReceivableId
        ? { targetReceivableId }
        : {}),
    })
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
      clearExcessChoice()
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
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
              onClick={() => handleOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              type="button"
              disabled={
                createMutation.isPending ||
                (exceedsOutstanding && excessHandling === null) ||
                targetMissing
              }
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
                amountError={amountError}
                currency={currency}
              />
            )}
          />
          {outstanding !== undefined && outstanding > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue("amount", String(outstanding), {
                    shouldValidate: true,
                  })
                }
              >
                <CoinsIcon className="size-4 shrink-0" />
                {`Todo ${formatFinanceMoney(outstanding, receivableDisplay)}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setValue("amount", String(outstanding / 2), {
                    shouldValidate: true,
                  })
                }
              >
                <DivideIcon className="size-4 shrink-0" />
                Mitad
              </Button>
            </div>
          ) : null}
          {exceedsOutstanding && outstanding !== undefined ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-border p-3">
              <p className="text-sm font-semibold">
                Sobra {formatFinanceMoney(excessAmount, receivableDisplay)}
              </p>
              <p className="text-sm text-muted-foreground">
                Elige qué hacer con la diferencia.
              </p>
              <div className="flex flex-wrap gap-2">
                {excessOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={
                        excessHandling === option.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setExcessHandling(option.value)
                        setTargetReceivableId(null)
                      }}
                    >
                      <Icon className="size-4 shrink-0" />
                      {option.label}
                    </Button>
                  )
                })}
              </div>
              {excessHandling === "APPLY_TO_RECEIVABLE" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Cobro que recibe</p>
                  {targetOptions.map((option) => (
                    <Button
                      key={option.id}
                      type="button"
                      variant={
                        targetReceivableId === option.id ? "default" : "outline"
                      }
                      size="sm"
                      className="justify-between"
                      onClick={() => setTargetReceivableId(option.id)}
                    >
                      <span className="truncate">{option.debtorName}</span>
                      <span className="tabular-nums">
                        {formatFinanceMoney(
                          String(option.pending),
                          receivableDisplay
                        )}
                      </span>
                    </Button>
                  ))}
                  {targetMissing ? (
                    <p className="text-xs text-muted-foreground">
                      Elige el cobro que recibe la diferencia.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
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

      {discardChangesDialog}

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
