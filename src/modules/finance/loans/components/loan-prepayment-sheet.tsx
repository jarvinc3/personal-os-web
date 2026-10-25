"use client"

import { apiGet } from "@/src/config/api-client"
import { FinanceHelpText } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoanPrepayment } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import {
  buildLoanPrepaymentBody,
  type LoanPrepaymentMode,
} from "@/src/modules/finance/shared/lib/planning-payloads"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  CalendarClockIcon,
  CoinsIcon,
  HandCoinsIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

type PrepaymentPreview = {
  newBalance: number
  totalInstallments: number
  installmentAmount: number
  interestRemaining: number
  newEndDate: string
}

type LoanPrepaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string
  lenderName: string
  currency: string
  penaltyPct: string | null
}

export function LoanPrepaymentSheet({
  open,
  onOpenChange,
  loanId,
  lenderName,
  currency,
  penaltyPct,
}: LoanPrepaymentSheetProps) {
  const prepayment = useLoanPrepayment()
  const { config, formatLocale } = useFinanceEnabled()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const accounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive
  )
  const institutions = institutionsQuery.data ?? []
  const [amount, setAmount] = useState("")
  const [mode, setMode] = useState<LoanPrepaymentMode>("REDUCE_TERM")
  const [accountId, setAccountId] = useState("")
  const [amountError, setAmountError] = useState<string | null>(null)
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "account">(
    "none"
  )
  const effectiveAccountId = accountId || accounts[0]?.id || ""
  const parsedAmount = parseFinanceMoney(amount)
  const display = {
    currency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const previewQuery = useQuery({
    queryKey: ["finance", "loans", loanId, "prepayment-preview", amount, mode],
    enabled: open && parsedAmount !== null && parsedAmount > 0,
    queryFn: () =>
      apiGet<PrepaymentPreview>(
        `${API_ENDPOINTS.FINANCE.LOAN_PREPAYMENTS_PREVIEW(loanId)}?amount=${parsedAmount}&mode=${mode}`
      ),
  })
  const preview = previewQuery.data

  const penalty = penaltyPct ? Number(penaltyPct) * (parsedAmount ?? 0) : 0

  async function onSubmit() {
    const payload = buildLoanPrepaymentBody({
      amount,
      accountId: effectiveAccountId,
      mode,
    })
    if (!payload.ok) {
      setAmountError(payload.error)
      return
    }
    try {
      await prepayment.mutateAsync({ loanId, body: payload.body })
      appToast.success({ text1: "Abono aplicado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        pending={prepayment.isPending}
        title="Abonar a capital"
        description={`Reduce la deuda de ${lenderName}.`}
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
              disabled={prepayment.isPending}
              className="flex-1"
              onClick={() => void onSubmit()}
            >
              {prepayment.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Abonar
            </Button>
          ),
        }}
      >
        <SummarySection title="Abono" icon={HandCoinsIcon}>
          <FinanceMoneyField
            label="Monto"
            amount={amount}
            onAmountChange={setAmount}
            onAmountCommit={(next) => setAmount(next)}
            amountError={amountError ?? undefined}
            currency={currency}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mode === "REDUCE_TERM" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("REDUCE_TERM")}
            >
              <CalendarClockIcon className="size-4 shrink-0" />
              Reducir plazo
            </Button>
            <Button
              type="button"
              variant={mode === "REDUCE_INSTALLMENT" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("REDUCE_INSTALLMENT")}
            >
              <CoinsIcon className="size-4 shrink-0" />
              Reducir cuota
            </Button>
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
          {preview ? (
            <FinanceHelpText>
              {`Termina el ${formatCalendarDate(preview.newEndDate, display.locale)} · Interés restante ${formatFinanceMoney(preview.interestRemaining, display)}`}
            </FinanceHelpText>
          ) : null}
          {penalty > 0 ? (
            <FinanceHelpText>
              {`Penalidad estimada ${formatFinanceMoney(penalty, display)}`}
            </FinanceHelpText>
          ) : null}
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
