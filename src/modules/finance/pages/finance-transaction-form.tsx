"use client"

import { TransactionForm } from "@/src/modules/finance/components/transactions/transaction-form"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useTransaction } from "@/src/modules/finance/hooks/use-transactions"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  APP_ROUTES,
  parseTransactionFormType,
} from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export function FinanceTransactionCreateClient() {
  const searchParams = useSearchParams()
  const initialType = parseTransactionFormType(searchParams.get("type"))
  const initialDestination = searchParams.get("destination")?.trim() || null
  return (
    <FinanceAuthenticatedPage>
      <FinanceTransactionFormView
        mode="create"
        initialType={initialType}
        initialDestination={initialDestination}
      />
    </FinanceAuthenticatedPage>
  )
}

export function FinanceTransactionEditClient({
  transactionId,
}: {
  transactionId: string
}) {
  return (
    <FinanceAuthenticatedPage>
      <FinanceTransactionFormView
        mode="edit"
        transactionId={transactionId}
        initialType="DEBIT"
      />
    </FinanceAuthenticatedPage>
  )
}

function FinanceTransactionFormView({
  mode,
  transactionId,
  initialType,
  initialDestination = null,
}: {
  mode: "create" | "edit"
  transactionId?: string
  initialType: "DEBIT" | "CREDIT"
  initialDestination?: string | null
}) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const [liveType, setLiveType] = useState(initialType)
  const editingQuery = useTransaction(
    isEnabled && mode === "edit",
    transactionId ?? null,
  )

  useEffect(() => {
    setLiveType(initialType)
  }, [initialType])

  useEffect(() => {
    if (mode !== "edit") return
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

  usePageHeader(
    {
      variant: "secondary",
      title,
      onBack: handleBack,
    },
    [title, handleBack],
  )

  if (mode === "edit" && !editingQuery.data) {
    if (editingQuery.isError || !transactionId) return null
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
      transaction={editingQuery.data ?? null}
      defaultCurrency={config.baseCurrency}
      enabled={isEnabled}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
      }}
      onTypeChange={setLiveType}
      onDone={handleBack}
    />
  )
}
