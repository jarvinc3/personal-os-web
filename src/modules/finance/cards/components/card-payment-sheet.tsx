"use client"

import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceHelpText } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateCardPayment } from "@/src/modules/finance/shared/hooks/use-transactions"
import {
  cardPaymentDuplicateDateLabel,
  cardPaymentDuplicateFromError,
  nextCardPaymentDuplicateDialog,
} from "@/src/modules/finance/shared/lib/card-payment-duplicate"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  todayDateInput,
  wallClockToIso,
} from "@/src/modules/finance/shared/lib/ledger-form"
import {
  buildCreateCardPaymentBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  CalendarIcon,
  CoinsIcon,
  CreditCardIcon,
  PlusIcon,
  TriangleAlertIcon,
  WalletIcon,
} from "lucide-react"
import { useMemo, useReducer, useState } from "react"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"

type CardPaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: string
  cardName: string
  currencies: readonly string[]
  defaultCurrency: string
  minimumPayment?: string
  closingBalance?: string
}

export function CardPaymentSheet({
  open,
  onOpenChange,
  cardId,
  cardName,
  currencies,
  defaultCurrency,
  minimumPayment,
  closingBalance,
}: CardPaymentSheetProps) {
  const createMutation = useCreateCardPayment()
  const { config, formatLocale } = useFinanceEnabled()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const [currency, setCurrency] = useState(currencies[0] ?? defaultCurrency)
  const accounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive
  )
  const institutions = institutionsQuery.data ?? []
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [transactionDate, setTransactionDate] = useState(todayDateInput())
  const timeZone = useUserTimeZone()
  const [amountError, setAmountError] = useState<string | null>(null)
  const [pendingDuplicate, dispatchDuplicate] = useReducer(
    nextCardPaymentDuplicateDialog,
    null
  )
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "account">(
    "none"
  )

  const display = useMemo(
    () => ({
      currency,
      showCents: config.display.showCents,
      compactNumbers: config.display.compactNumbers,
      locale: formatLocale,
    }),
    [
      currency,
      config.display.compactNumbers,
      config.display.showCents,
      formatLocale,
    ]
  )

  const effectiveAccountId = accountId || accounts[0]?.id || ""
  const sourceAccountName =
    accounts.find((account) => account.id === effectiveAccountId)?.name ??
    "Cuenta de origen"

  async function onSubmit() {
    const payload = buildCreateCardPaymentBody({
      fromAccountId: effectiveAccountId,
      cardId,
      amount,
      currency,
      transactionDate: wallClockToIso(transactionDate, timeZone),
    })
    if (!payload.ok) {
      setAmountError(payload.error)
      return
    }
    try {
      await createMutation.mutateAsync(payload.body)
      appToast.success({ text1: "Pago registrado" })
      onOpenChange(false)
    } catch (error) {
      const candidate = cardPaymentDuplicateFromError(error)
      if (candidate) {
        dispatchDuplicate({ type: "CONFLICT", body: payload.body, candidate })
        return
      }
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  /** Reenvía el mismo pago confirmando que no es el duplicado del importado. */
  async function confirmDuplicate() {
    if (!pendingDuplicate) {
      return
    }
    try {
      await createMutation.mutateAsync({
        ...pendingDuplicate.body,
        duplicateAcknowledged: true,
      })
      appToast.success({ text1: "Pago registrado" })
      dispatchDuplicate({ type: "CONFIRMED" })
      onOpenChange(false)
    } catch (error) {
      dispatchDuplicate({ type: "ACKNOWLEDGEMENT_FAILED" })
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const minimum = minimumPayment ? parseFinanceMoney(minimumPayment) : null
  const closing = closingBalance ? parseFinanceMoney(closingBalance) : null

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        pending={createMutation.isPending}
        title="Pagar tarjeta"
        description={`Sale de tu cuenta y sube el disponible de ${cardName}.`}
        actions={{
          submit: (
            <Button
              type="button"
              disabled={createMutation.isPending}
              className="flex-1"
              onClick={() => void onSubmit()}
            >
              {createMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Pagar
            </Button>
          ),
        }}
      >
        <SummarySection title="Pago" icon={CreditCardIcon}>
          {currencies.length > 1 ? (
            <SegmentedControl
              label="Moneda"
              value={currency}
              onChange={setCurrency}
              options={currencies.map((code) => ({
                value: code,
                label: code,
              }))}
            />
          ) : null}
          <FinanceMoneyField
            calculatorKey="card-payment-amount"
            label="Monto"
            amount={amount}
            onAmountChange={setAmount}
            onAmountCommit={(next) => setAmount(next)}
            amountError={amountError ?? undefined}
            currency={currency}
          />
          <div className="flex flex-wrap gap-2">
            {minimum !== null && minimum > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(minimum))}
              >
                <CoinsIcon className="size-4 shrink-0" />
                {`Pago mínimo ${formatFinanceMoney(minimum, display)}`}
              </Button>
            ) : null}
            {closing !== null && closing > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(closing))}
              >
                <WalletIcon className="size-4 shrink-0" />
                {`Balance al corte ${formatFinanceMoney(closing, display)}`}
              </Button>
            ) : null}
          </div>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Cuenta de origen
            </FieldLabel>
            <DestinationTrigger
              destination={
                effectiveAccountId
                  ? encodeLedgerTarget("account", effectiveAccountId)
                  : CATALOG_NONE
              }
              accounts={accounts}
              cards={[]}
              display={display}
              placeholder="Elige la cuenta"
              onClick={() => openPicker("account")}
            />
            {accounts.length === 0 ? (
              <FieldError>Necesitas una cuenta activa.</FieldError>
            ) : null}
          </Field>
          <FinanceDateField
            label="Fecha"
            value={transactionDate}
            onChange={setTransactionDate}
          />
          <FinanceHelpText>
            El pago no cuenta como gasto: solo mueve dinero a la tarjeta.
          </FinanceHelpText>
        </SummarySection>
      </BottomSheet>

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={institutions}
        accounts={accounts}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(next) =>
          setAccountId(splitLedgerTarget(next).accountId ?? "")
        }
      />

      <ConfirmDialog
        open={pendingDuplicate !== null}
        onOpenChange={(open) => {
          if (!open) {
            dispatchDuplicate({ type: "CANCELLED" })
          }
        }}
        icon={TriangleAlertIcon}
        title="Ya hay un pago parecido"
        description="Ese pago llegó por correo y todavía no está registrado a mano. Si continúas, quedan dos pagos con los mismos datos."
        confirmLabel="Registrar igual"
        confirmIcon={PlusIcon}
        pending={createMutation.isPending}
        pendingLabel="Registrando..."
        onConfirm={() => void confirmDuplicate()}
        closeOnConfirm={false}
        wide
      >
        {pendingDuplicate ? (
          <div className="flex flex-col">
            <SummaryItem
              title="Monto"
              icon={CoinsIcon}
              value={formatFinanceMoney(pendingDuplicate.candidate.amount, {
                ...display,
                currency: pendingDuplicate.candidate.currency ?? "",
              })}
            />
            <SummaryItem
              title="Fecha"
              icon={CalendarIcon}
              value={
                cardPaymentDuplicateDateLabel(pendingDuplicate.candidate, {
                  timeZone,
                  locale: formatLocale,
                }) ?? "—"
              }
            />
            <SummaryItem
              title="Cuenta de origen"
              icon={WalletIcon}
              value={sourceAccountName}
            />
            <SummaryItem
              title="Tarjeta"
              icon={CreditCardIcon}
              value={cardName}
              isLast
            />
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  )
}
