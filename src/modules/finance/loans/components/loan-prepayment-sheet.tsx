"use client"

import { apiGet } from "@/src/config/api-client"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoanPrepayment } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  PREPAYMENT_MODE_EXPLANATION,
  prepaymentPreviewLines,
  type LoanPrepaymentPreview,
} from "@/src/modules/finance/shared/lib/loan-prepayment"
import { defaultLoanPaymentAccountId } from "@/src/modules/finance/shared/lib/loan-payment"
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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
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

type LoanPrepaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string
  lenderName: string
  currency: string
  penaltyPct: string | null
  /** «Se paga desde» del préstamo: la cuenta que se propone para el abono. */
  loanAccountId: string | null
  /** Cuotas actuales del préstamo, para explicar si el plazo cambia. */
  currentInstallments: number
}

export function LoanPrepaymentSheet({
  open,
  onOpenChange,
  loanId,
  lenderName,
  currency,
  penaltyPct,
  loanAccountId,
  currentInstallments,
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
  const effectiveAccountId =
    accountId ||
    defaultLoanPaymentAccountId({ accounts, loanAccountId, currency })
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
      apiGet<LoanPrepaymentPreview>(
        `${API_ENDPOINTS.FINANCE.LOAN_PREPAYMENTS_PREVIEW(loanId)}?amount=${parsedAmount}&mode=${mode}`
      ),
  })
  const preview = previewQuery.data
  const previewLines = preview
    ? prepaymentPreviewLines({
        preview,
        currentInstallments,
        mode,
        display,
      })
    : []

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
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <SheetHeader
            title="Abonar a capital"
            description={`Reduce la deuda de ${lenderName}.`}
            pending={prepayment.isPending}
            actions={
              <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.loanPrepayment} />
            }
          />
          <SheetBody pending={prepayment.isPending}>
            <SummarySection title="Abono" icon={HandCoinsIcon}>
              <FinanceMoneyField
                calculatorKey="loan-prepayment-amount"
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
                  variant={
                    mode === "REDUCE_INSTALLMENT" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setMode("REDUCE_INSTALLMENT")}
                >
                  <CoinsIcon className="size-4 shrink-0" />
                  Reducir cuota
                </Button>
              </div>
              <FieldDescription className="text-xs">
                {PREPAYMENT_MODE_EXPLANATION[mode]}
              </FieldDescription>
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
              {previewLines.map((line) => (
                <FieldDescription key={line} className="text-xs">
                  {line}
                </FieldDescription>
              ))}
              {penalty > 0 ? (
                <FieldDescription className="text-xs">
                  {`Penalidad estimada ${formatFinanceMoney(penalty, display)}`}
                </FieldDescription>
              ) : null}
            </SummarySection>
          </SheetBody>
          {!prepayment.isPending ? (
            <DrawerFooter className={SHEET_FOOTER_CLASS}>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <XIcon className="size-4 shrink-0" aria-hidden="true" />
                Cancelar
              </Button>
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
            </DrawerFooter>
          ) : null}
        </DrawerContent>
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
      </Drawer>
    </>
  )
}
