"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceTransactionsList } from "@/src/modules/finance/transactions/components/transactions-list"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"

export function TransactionsScreen() {
  return (
    <FinanceGate>
      <TransactionsScreenBody />
    </FinanceGate>
  )
}

function TransactionsScreenBody() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  return <FinanceTransactionsList enabled={isEnabled} display={display} />
}
