"use client"

import { FinanceProductsList } from "@/src/modules/finance/products/components/products-list"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"

export function ProductsScreen() {
  return (
    <FinanceGate>
      <ProductsScreenBody />
    </FinanceGate>
  )
}

function ProductsScreenBody() {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  return (
    <FinanceProductsList
      enabled={isEnabled}
      display={display}
      defaultCurrency={config.baseCurrency}
    />
  )
}
