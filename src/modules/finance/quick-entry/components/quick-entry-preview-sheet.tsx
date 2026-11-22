"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { appToast } from "@/src/shared/lib/app-toast"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useCreateTransaction } from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  buildCreateTransactionBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import { wallClockToIso } from "@/src/modules/finance/shared/lib/ledger-form"
import { buildTransactionFormParams } from "@/src/modules/finance/transactions/lib/transaction-prefill"
import type { QuickEntryParseResult } from "@/src/modules/finance/quick-entry/types"
import { AlignLeftIcon, SquarePenIcon, StoreIcon } from "lucide-react"

type QuickEntryPreviewSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  parseResult: QuickEntryParseResult | null
}

const TYPE_OPTIONS = [
  { value: "DEBIT" as const, label: "Gasto" },
  { value: "CREDIT" as const, label: "Ingreso" },
]

function initialDestination(parseResult: QuickEntryParseResult | null): string {
  if (!parseResult) {
    return ""
  }
  const { accountId, cardId } = parseResult.draft
  if (accountId) {
    return encodeLedgerTarget("account", accountId)
  }
  if (cardId) {
    return encodeLedgerTarget("card", cardId)
  }
  return ""
}

export function QuickEntryPreviewSheet({
  open,
  onOpenChange,
  parseResult,
}: QuickEntryPreviewSheetProps) {
  const router = useRouter()
  const { config, formatLocale } = useFinanceEnabled()
  const accounts = useAccounts(open).data ?? []
  const cards = useCards(open).data ?? []
  const institutions = useInstitutions(open).data ?? []
  const categories = useCategories(open).data ?? []
  const createTransaction = useCreateTransaction()

  const draft = parseResult?.draft ?? null
  const timeZone = useUserTimeZone()
  const [type, setType] = useState<"DEBIT" | "CREDIT">(draft?.type ?? "DEBIT")
  const [amount, setAmount] = useState(draft?.amount ?? "")
  const [categoryId, setCategoryId] = useState(draft?.categoryId ?? "")
  const [destination, setDestination] = useState(() =>
    initialDestination(parseResult)
  )
  const [date, setDate] = useState(draft?.date ?? "")
  const [merchant, setMerchant] = useState(draft?.merchant ?? "")
  const [description, setDescription] = useState(draft?.description ?? "")
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "category" | "destination"
  >("none")

  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? null
  const target = splitLedgerTarget(destination)
  const hasTarget = Boolean(target.accountId ?? target.cardId)
  const canSave = Number(amount) > 0 && hasTarget

  function openGuidedFlow() {
    const params = buildTransactionFormParams({
      type,
      destination,
      amount,
      currency: draft?.currency,
      categoryId,
      transactionDate: date,
      merchant,
      description,
    })
    onOpenChange(false)
    router.push(`${APP_ROUTES.app.financeTransactionNew}?${params.toString()}`)
  }

  async function save() {
    const body = buildCreateTransactionBody({
      accountId: target.accountId,
      cardId: target.cardId,
      type,
      amount,
      currency: draft?.currency,
      transactionDate: wallClockToIso(date, timeZone),
      merchant: merchant || undefined,
      description: description || undefined,
      categoryId: categoryId || undefined,
    })
    if (!body.ok) {
      appToast.error({ text1: body.error })
      return
    }
    try {
      await createTransaction.mutateAsync(body.body)
      appToast.success({ text1: "Movimiento guardado" })
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
        title="Vista previa"
        helpAction={
          <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.quickEntryPreview} />
        }
      >
        <div className="flex flex-col gap-4">
          <SegmentedControl
            label="Tipo"
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
            fullWidth
          />

          <FinanceMoneyField
            calculatorKey="quick-entry-amount"
            amount={amount}
            onAmountChange={setAmount}
            onAmountCommit={setAmount}
            currency={display.currency}
          />

          <div className="flex flex-col gap-1">
            <span className="px-1 text-xs text-muted-foreground">
              Categoría
            </span>
            <CategoryTrigger
              category={selectedCategory}
              onClick={() => openPicker("category")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="px-1 text-xs text-muted-foreground">
              Cuenta o tarjeta
            </span>
            <DestinationTrigger
              destination={destination}
              accounts={accounts}
              cards={cards}
              display={display}
              onClick={() => openPicker("destination")}
            />
          </div>

          <FinanceDateField label="Fecha" value={date} onChange={setDate} />

          <FormTextField
            value={merchant}
            onChange={setMerchant}
            ariaLabel="Comercio"
            icon={StoreIcon}
          />
          <FormTextField
            value={description}
            onChange={setDescription}
            ariaLabel="Descripción"
            icon={AlignLeftIcon}
          />

          {canSave ? (
            <Button
              type="button"
              onClick={save}
              disabled={createTransaction.isPending}
            >
              {createTransaction.isPending ? <Spinner /> : null}
              Guardar
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={openGuidedFlow}>
              <SquarePenIcon className="size-4 shrink-0" />
              Completar en el formulario
            </Button>
          )}
        </div>
      </BottomSheet>

      {/* La vista previa se cierra sola al recargar: el selector no vive sin ella. */}
      <CategoryPickerSheet
        open={open && picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType={type === "DEBIT" ? "EXPENSE" : "INCOME"}
        value={categoryId}
        onSelect={setCategoryId}
      />

      <DestinationPickerSheet
        open={open && picker === "destination"}
        onOpenChange={closeHandlerFor("destination")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={display}
        onSelect={setDestination}
      />
    </>
  )
}
