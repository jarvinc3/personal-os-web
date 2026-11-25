"use client"

import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { usePayLoanInstallment } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  defaultLoanPaymentAccountId,
  installmentDueTotal,
  installmentExcess,
} from "@/src/modules/finance/shared/lib/loan-payment"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { buildPayLoanInstallmentBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
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
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  CircleCheckIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"
import type { FinanceLoanInstallment } from "@/src/modules/finance/shared/types/entities"

type LoanPaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string
  lenderName: string
  currency: string
  /** «Se paga desde» del préstamo. */
  loanAccountId: string | null
  installment: FinanceLoanInstallment | null
}

export function LoanPaymentSheet({
  open,
  onOpenChange,
  loanId,
  lenderName,
  currency,
  loanAccountId,
  installment,
}: LoanPaymentSheetProps) {
  const payment = usePayLoanInstallment()
  const { config, formatLocale } = useFinanceEnabled()
  const accountsQuery = useAccounts(open)
  const institutionsQuery = useInstitutions(open)
  const accounts = (accountsQuery.data ?? []).filter(
    (account) => account.isActive
  )
  const institutions = institutionsQuery.data ?? []
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [excessAsPrepayment, setExcessAsPrepayment] = useState(false)
  const [amountError, setAmountError] = useState<string | null>(null)
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "account">(
    "none"
  )
  const display = {
    currency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const dueTotal = installment ? installmentDueTotal(installment) : 0
  const effectiveAccountId =
    accountId ||
    defaultLoanPaymentAccountId({
      accounts,
      loanAccountId,
      currency,
    })
  // The field works with a raw amount, so the default is the plain due total.
  const defaultAmount = installment ? dueTotal.toFixed(2) : ""
  const writtenAmount = amount || defaultAmount
  const parsedAmount = parseFinanceMoney(writtenAmount) ?? 0
  const excess = installmentExcess(parsedAmount, dueTotal)
  const needsExcessChoice = excess > 0 && !excessAsPrepayment
  const canSubmit =
    installment !== null &&
    parsedAmount > 0 &&
    Boolean(effectiveAccountId) &&
    !needsExcessChoice

  function resetExcess() {
    setAmount("")
    setExcessAsPrepayment(false)
  }

  async function onSubmit() {
    const payload = buildPayLoanInstallmentBody({
      amount: writtenAmount,
      accountId: effectiveAccountId,
      excessAsPrepayment,
    })
    if (!payload.ok) {
      setAmountError(payload.error)
      return
    }
    try {
      const paymentResult = await payment.mutateAsync({
        loanId,
        body: payload.body,
      })
      appToast.success({
        text1:
          paymentResult.status === "PAID"
            ? `Cuota ${paymentResult.installmentNo} pagada`
            : `Abono parcial a la cuota ${paymentResult.installmentNo}`,
      })
      resetExcess()
      setAmountError(null)
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setAmountError(null)
    }
    onOpenChange(next)
  }

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <SheetHeader
            title="Pagar cuota"
            description={`Paga la cuota pendiente más antigua de ${lenderName}.`}
            pending={payment.isPending}
            actions={
              <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.loanPayment} />
            }
          />
          <SheetBody pending={payment.isPending}>
            {installment ? (
              <>
                <SummarySection title="Cuota" icon={LandmarkIcon}>
                  <p className="px-2 text-sm text-muted-foreground">
                    {`Cuota ${installment.installmentNo} · vence el ${formatCalendarDate(installment.dueDate, display.locale)}`}
                  </p>
                  <dl className="grid grid-cols-2 gap-2 px-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Capital</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatFinanceMoney(installment.principal, display)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Interés</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatFinanceMoney(installment.interest, display)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Seguro</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatFinanceMoney(installment.insurance, display)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Cargos y mora
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {formatFinanceMoney(
                          (parseFinanceMoney(installment.fees) ?? 0) +
                            (parseFinanceMoney(installment.lateFee) ?? 0),
                          display
                        )}
                      </dd>
                    </div>
                  </dl>
                  <p className="px-2 text-sm font-semibold tabular-nums">
                    {`Total ${formatFinanceMoney(dueTotal, display)}`}
                  </p>
                </SummarySection>

                <SummarySection title="Pago" icon={HandCoinsIcon}>
                  <FinanceMoneyField
                    calculatorKey="loan-payment-amount"
                    label="Monto"
                    amount={writtenAmount}
                    onAmountChange={(next) => {
                      setAmount(next)
                      setExcessAsPrepayment(false)
                    }}
                    onAmountCommit={(next) => setAmount(next)}
                    amountError={amountError ?? undefined}
                    currency={currency}
                  />
                  {needsExcessChoice ? (
                    <Alert>
                      <CircleCheckIcon />
                      <AlertTitle>
                        {`Pagas ${formatFinanceMoney(excess, display)} de más`}
                      </AlertTitle>
                      <AlertDescription>
                        Elige si ese excedente abona al capital o si corriges el
                        monto de la cuota.
                      </AlertDescription>
                      <div className="col-start-2 mt-2 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setExcessAsPrepayment(true)}
                        >
                          <HandCoinsIcon className="size-4 shrink-0" />
                          Abonar el excedente a capital
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setAmount("")}
                        >
                          <PencilIcon className="size-4 shrink-0" />
                          Corregir el monto
                        </Button>
                      </div>
                    </Alert>
                  ) : null}
                  {excessAsPrepayment && excess > 0 ? (
                    <FieldDescription className="text-xs">
                      {`El excedente de ${formatFinanceMoney(excess, display)} abona al capital.`}
                    </FieldDescription>
                  ) : null}
                  {parsedAmount > 0 && parsedAmount < dueTotal ? (
                    <FieldDescription className="text-xs">
                      {`Pago parcial: quedarán ${formatFinanceMoney(dueTotal - parsedAmount, display)} de esta cuota.`}
                    </FieldDescription>
                  ) : null}
                  <Field className="gap-1">
                    <FieldLabel className="text-sm text-muted-foreground">
                      Cuenta de pago
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
                </SummarySection>
              </>
            ) : (
              <FieldDescription className="text-xs">
                Este préstamo no tiene cuotas pendientes.
              </FieldDescription>
            )}
          </SheetBody>
          {!payment.isPending ? (
            <DrawerFooter className={SHEET_FOOTER_CLASS}>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                <XIcon className="size-4 shrink-0" aria-hidden="true" />
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={payment.isPending || !canSubmit}
                onClick={() => void onSubmit()}
              >
                {payment.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HandCoinsIcon className="size-4 shrink-0" />
                )}
                Pagar cuota
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
