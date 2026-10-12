"use client"

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
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { buildCreateCardPaymentBody } from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { CreditCardIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"

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
  const { config } = useFinanceEnabled()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const currency = currencies[0] ?? defaultCurrency
  const accounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive
  )
  const institutions = institutionsQuery.data ?? []
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [transactionDate, setTransactionDate] = useState(todayDateInput())
  const [amountError, setAmountError] = useState<string | null>(null)
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "account">(
    "none"
  )

  const display = useMemo(
    () => ({
      currency,
      showCents: config.display.showCents,
      compactNumbers: config.display.compactNumbers,
    }),
    [currency, config.display.compactNumbers, config.display.showCents]
  )

  const effectiveAccountId = accountId || accounts[0]?.id || ""

  async function onSubmit() {
    const payload = buildCreateCardPaymentBody({
      fromAccountId: effectiveAccountId,
      cardId,
      amount,
      currency,
      transactionDate,
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
          <FinanceMoneyField
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
    </>
  )
}
