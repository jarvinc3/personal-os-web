"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
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
  XIcon,
} from "lucide-react"
import { useMemo, useReducer, useState } from "react"
import type { FinanceCard } from "@/src/modules/finance/shared/types/entities"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"

type CardPaymentSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: FinanceCard
  currencies: readonly string[]
  defaultCurrency: string
  minimumPayment?: string
  closingBalance?: string
}

export function CardPaymentSheet({
  open,
  onOpenChange,
  card,
  currencies,
  defaultCurrency,
  minimumPayment,
  closingBalance,
}: CardPaymentSheetProps) {
  const cardId = card.id
  const cardName = card.name
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
  const sourceAccount =
    accounts.find((account) => account.id === effectiveAccountId) ?? null

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
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <SheetHeader
            title="Pagar tarjeta"
            description={`Sale de tu cuenta y sube el disponible de ${cardName}.`}
            pending={createMutation.isPending}
            actions={
              <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.cardPayment} />
            }
          />
          <SheetBody pending={createMutation.isPending}>
            <SummarySection title="Pago" icon={CreditCardIcon}>
              {currencies.length > 1 ? (
                <Field className="gap-1">
                  <FieldLabel>Moneda</FieldLabel>
                  <ToggleGroup
                    value={[currency]}
                    onValueChange={(next) => {
                      if (next.length > 0) {
                        setCurrency(next[0])
                      }
                    }}
                    variant="outline"
                    size="sm"
                    aria-label="Moneda"
                  >
                    {currencies.map((code) => (
                      <ToggleGroupItem
                        key={code}
                        value={code}
                        className="rounded-full"
                      >
                        {code}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
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
              <FieldDescription className="text-xs">
                El pago no cuenta como gasto: solo mueve dinero a la tarjeta.
              </FieldDescription>
            </SummarySection>
          </SheetBody>
          {!createMutation.isPending ? (
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
                disabled={createMutation.isPending}
                className="flex-1"
                onClick={() => void onSubmit()}
              >
                {createMutation.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                Pagar
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

      <AlertDialog
        open={pendingDuplicate !== null}
        onOpenChange={(open) => {
          if (!open && !createMutation.isPending) {
            dispatchDuplicate({ type: "CANCELLED" })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <TriangleAlertIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Ya hay un pago parecido</AlertDialogTitle>
            <AlertDialogDescription>
              Ese pago llegó por correo y todavía no está registrado a mano. Si
              continúas, quedan dos pagos con los mismos datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingDuplicate ? (
            <div className="flex flex-col gap-2">
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
                  isLast
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-1 text-xs text-muted-foreground">
                  Cuenta de origen
                </span>
                {sourceAccount ? (
                  <AccountProductRow
                    account={sourceAccount}
                    display={display}
                    variant="compact"
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-1 text-xs text-muted-foreground">
                  Tarjeta
                </span>
                <CardProductRow
                  card={card}
                  accounts={accounts}
                  display={display}
                  variant="compact"
                />
              </div>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <Button
              disabled={createMutation.isPending}
              onClick={() => void confirmDuplicate()}
            >
              {createMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {createMutation.isPending ? "Registrando..." : "Registrar igual"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
