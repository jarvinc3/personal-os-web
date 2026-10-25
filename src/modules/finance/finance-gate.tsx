"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { FinanceLayout } from "@/src/modules/finance/shared/components/layout/layout"
import { financeSectionTitle } from "@/src/modules/finance/shared/constants/nav"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  APP_ROUTES,
  settingsModuleHref,
} from "@/src/shared/constants/app-routes"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { useHeaderContext } from "@/src/shared/context/header-context"
import { LandmarkIcon, SettingsIcon } from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, type ReactNode } from "react"

const SETTINGS_FINANCE_HREF = settingsModuleHref("finance")

const FINANCE_PRIMARY_ROUTES = new Set<string>([
  APP_ROUTES.app.finance,
  APP_ROUTES.app.financeOverview,
  APP_ROUTES.app.financeStatistics,
  APP_ROUTES.app.financeProducts,
  APP_ROUTES.app.financeTransactions,
  APP_ROUTES.app.financePlanning,
])

function isFinanceSecondaryView(pathname: string): boolean {
  return !FINANCE_PRIMARY_ROUTES.has(pathname)
}

export function FinanceGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setConfig, resetConfig } = useHeaderContext()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthGuard()
  const { isEnabled, isProfileLoading } = useFinanceEnabled()
  const secondaryView = isFinanceSecondaryView(pathname)

  useLayoutEffect(() => {
    if (secondaryView) {
      return
    }
    setConfig({
      title: financeSectionTitle(pathname) ?? "Finanzas",
    })
  }, [secondaryView, pathname, setConfig])

  useLayoutEffect(() => {
    return () => {
      if (!secondaryView) {
        resetConfig()
      }
    }
  }, [secondaryView, resetConfig])

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isAuthLoading, router])

  if (isAuthLoading || !isAuthenticated || isProfileLoading) {
    return <LoadingView variant="screen" />
  }

  if (!isEnabled) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col p-4 pb-16 md:px-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Finanzas está desactivado</EmptyTitle>
            <EmptyDescription>
              Activa la app en Ajustes para ver cuentas, movimientos y resumen.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={SETTINGS_FINANCE_HREF} className="relative">
                <SettingsIcon className="size-4 shrink-0" />
                Activar en Ajustes
                <LinkPendingOverlay />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return <FinanceLayout>{children}</FinanceLayout>
}
