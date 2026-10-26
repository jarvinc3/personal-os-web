"use client"

import { TransactionForm } from "@/src/modules/finance/transactions/components/transaction-form"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useTransaction } from "@/src/modules/finance/shared/hooks/use-transactions"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  APP_ROUTES,
  internalReturnPath,
  parseTransactionFormType,
} from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  EMPTY_TRANSACTION_PREFILL,
  parseTransactionPrefill,
  readTransactionPrefillQuery,
  type TransactionPrefill,
} from "@/src/modules/finance/transactions/lib/transaction-prefill"

export function TransactionCreateScreen() {
  return (
    <FinanceGate>
      <TransactionCreateScreenBody />
    </FinanceGate>
  )
}

function TransactionCreateScreenBody() {
  const searchParams = useSearchParams()
  const initialType = parseTransactionFormType(searchParams.get("type"))
  const initialDestination = searchParams.get("destination")?.trim() || null
  const returnTo = internalReturnPath(searchParams.get("returnTo"))
  const prefillQuery = useMemo(
    () =>
      readTransactionPrefillQuery(new URLSearchParams(searchParams.toString())),
    [searchParams]
  )
  const initialPrefill = useMemo(
    () => parseTransactionPrefill(new URLSearchParams(prefillQuery)),
    [prefillQuery]
  )

  return (
    <TransactionFormScreenBody
      mode="create"
      initialType={initialType}
      initialDestination={initialDestination}
      initialPrefill={initialPrefill}
      returnTo={returnTo}
    />
  )
}

/** Only same-origin paths are accepted as the place to return after saving. */
export function TransactionEditScreen({
  transactionId,
}: {
  transactionId: string
}) {
  return (
    <FinanceGate>
      <TransactionFormScreenBody
        mode="edit"
        transactionId={transactionId}
        initialType="DEBIT"
      />
    </FinanceGate>
  )
}

function TransactionFormScreenBody({
  mode,
  transactionId,
  initialType,
  initialDestination = null,
  initialPrefill = EMPTY_TRANSACTION_PREFILL,
  returnTo = null,
}: {
  mode: "create" | "edit"
  transactionId?: string
  initialType: "DEBIT" | "CREDIT"
  initialDestination?: string | null
  initialPrefill?: TransactionPrefill
  returnTo?: string | null
}) {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const [typeOverride, setTypeOverride] = useState<{
    base: "DEBIT" | "CREDIT"
    next: "DEBIT" | "CREDIT"
  } | null>(null)
  const liveType =
    typeOverride?.base === initialType ? typeOverride.next : initialType
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const handleTypeChange = useCallback(
    (next: "DEBIT" | "CREDIT") => {
      setTypeOverride({ base: initialType, next })
      if (mode !== "create") {
        return
      }
      const params = new URLSearchParams(searchParams.toString())
      params.set("type", next)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [initialType, mode, pathname, router, searchParams]
  )
  const editingQuery = useTransaction(
    isEnabled && mode === "edit",
    transactionId ?? null
  )

  useEffect(() => {
    if (mode !== "edit") {
      return
    }
    if (!transactionId || editingQuery.isError) {
      router.replace(APP_ROUTES.app.financeTransactions)
    }
  }, [mode, transactionId, editingQuery.isError, router])

  const title =
    mode === "edit"
      ? "Editar movimiento"
      : liveType === "CREDIT"
        ? "Nuevo ingreso"
        : "Nuevo gasto"

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeTransactions)
  }, [router])

  const handleCreated = useCallback(() => {
    router.push(returnTo ?? APP_ROUTES.app.financeTransactions)
  }, [router, returnTo])

  usePageHeader(
    {
      variant: "secondary",
      title,
      onBack: handleBack,
    },
    [title, handleBack]
  )

  if (mode === "edit" && !editingQuery.data) {
    if (editingQuery.isError || !transactionId) {
      return null
    }
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <TransactionForm
      mode={mode}
      initialType={initialType}
      initialDestination={initialDestination}
      initialPrefill={initialPrefill}
      transaction={editingQuery.data ?? null}
      defaultCurrency={config.baseCurrency}
      defaultAccountId={config.defaultAccountId}
      enabled={isEnabled}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
        locale: formatLocale,
      }}
      onTypeChange={handleTypeChange}
      onDone={mode === "edit" ? handleBack : handleCreated}
    />
  )
}
