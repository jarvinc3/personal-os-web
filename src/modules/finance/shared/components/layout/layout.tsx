"use client"

import { FINANCE_NAV_ITEMS } from "@/src/modules/finance/shared/constants/nav"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  prefetchFinanceCategories,
  prefetchFinanceCurrentMonth,
  prefetchFinancePlanning,
  prefetchFinanceSync,
  scheduleIdle,
} from "@/src/modules/finance/shared/lib/finance-prefetch"
import { ModuleSectionLayout } from "@/src/shared/components/layout/module-section-layout"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, type ReactNode } from "react"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"

export function FinanceLayout({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const timeZone = useUserTimeZone()
  const { isEnabled, emailSyncEnabled, isProfileLoading } = useFinanceEnabled()

  useEffect(() => {
    if (!isEnabled || isProfileLoading) {
      return
    }

    return scheduleIdle(() => {
      void prefetchFinanceCategories(queryClient)
      void prefetchFinancePlanning(queryClient)
      void prefetchFinanceCurrentMonth({ queryClient, timeZone })
      if (emailSyncEnabled) {
        void prefetchFinanceSync(queryClient)
      }
    })
  }, [emailSyncEnabled, isEnabled, isProfileLoading, queryClient, timeZone])

  const onItemPrefetch = useCallback(
    (href: string) => {
      if (!isEnabled) {
        return
      }
      if (href === APP_ROUTES.app.financePlanning) {
        void prefetchFinancePlanning(queryClient)
      }
      if (href === APP_ROUTES.app.financeProducts) {
        void prefetchFinanceCategories(queryClient)
      }
      if (href === APP_ROUTES.app.financeTransactions) {
        void prefetchFinanceCurrentMonth({ queryClient, timeZone })
      }
    },
    [isEnabled, queryClient, timeZone]
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
