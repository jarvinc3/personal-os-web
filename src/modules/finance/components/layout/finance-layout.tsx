"use client"

import { FINANCE_NAV_ITEMS } from "@/src/modules/finance/constants/nav"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import {
  prefetchFinanceCategories,
  prefetchFinancePlanning,
  prefetchFinanceSync,
  scheduleIdle,
} from "@/src/modules/finance/lib/finance-prefetch"
import { ModuleSectionLayout } from "@/src/shared/components/layout/module-section-layout"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, type ReactNode } from "react"

export function FinanceLayout({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { isEnabled, emailSyncEnabled, isProfileLoading } = useFinanceEnabled()

  useEffect(() => {
    if (!isEnabled || isProfileLoading) {
      return
    }

    return scheduleIdle(() => {
      void prefetchFinanceCategories(queryClient)
      void prefetchFinancePlanning(queryClient)
      if (emailSyncEnabled) {
        void prefetchFinanceSync(queryClient)
      }
    })
  }, [emailSyncEnabled, isEnabled, isProfileLoading, queryClient])

  const onItemPrefetch = useCallback(
    (href: string) => {
      if (!isEnabled) {
        return
      }
      if (href === APP_ROUTES.app.financePlanning) {
        void prefetchFinancePlanning(queryClient)
      }
      if (href === APP_ROUTES.app.financeAccounts) {
        void prefetchFinanceCategories(queryClient)
      }
    },
    [isEnabled, queryClient],
  )

  return (
    <ModuleSectionLayout
      items={FINANCE_NAV_ITEMS.filter((item) => item.showInTabBar !== false)}
      ariaLabel="Secciones de Finanzas"
      onItemPrefetch={onItemPrefetch}
    >
      {children}
    </ModuleSectionLayout>
  )
}
