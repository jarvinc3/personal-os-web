"use client"

import { FinanceCategoriesSection } from "@/src/modules/finance/components/catalog/finance-categories-section";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { usePageHeader } from "@/src/shared/hooks/use-page-header";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function FinanceCategoriesClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceCategoriesView />
    </FinanceAuthenticatedPage>
  )
}

function FinanceCategoriesView() {
  const router = useRouter()
  const { isEnabled } = useFinanceEnabled()

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeAccounts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Categorías",
      onBack: handleBack,
    },
    [handleBack],
  )

  return <FinanceCategoriesSection enabled={isEnabled} editable />
}
