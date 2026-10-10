"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { FinanceLayout } from "@/src/modules/finance/components/layout/finance-layout"
import { financeSectionTitle } from "@/src/modules/finance/constants/nav"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import {
  APP_ROUTES,
  settingsModuleHref,
} from "@/src/shared/constants/app-routes"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
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
import { LandmarkIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, type ReactNode } from "react"

const SETTINGS_FINANCE_HREF = settingsModuleHref("finance")

const FINANCE_ACCOUNTS_PREFIX = `${APP_ROUTES.app.financeAccounts}/`

function isAccountDetailPath(pathname: string): boolean {
  if (!pathname.startsWith(FINANCE_ACCOUNTS_PREFIX)) {
    return false
  }
  const remainder = pathname.slice(FINANCE_ACCOUNTS_PREFIX.length)
  if (remainder.length === 0 || remainder.includes("/")) {
    return false
  }
  return (
    pathname !== APP_ROUTES.app.financeCategories &&
    pathname !== APP_ROUTES.app.financeSync
  )
}

function isFinanceSecondaryView(pathname: string): boolean {
  return (
    pathname === APP_ROUTES.app.financeCategories ||
    pathname === APP_ROUTES.app.financeSync ||
    pathname.startsWith(`${FINANCE_ACCOUNTS_PREFIX}institutions/`) ||
    pathname.startsWith(`${FINANCE_ACCOUNTS_PREFIX}cards/`) ||
    isAccountDetailPath(pathname) ||
    pathname.startsWith(`${APP_ROUTES.app.financeLoans}/`) ||
    pathname.startsWith(`${APP_ROUTES.app.financeSavingsGoals}/`) ||
    pathname.startsWith(`${APP_ROUTES.app.financeReceivables}/`) ||
    pathname.startsWith(`${APP_ROUTES.app.financeBudgets}/`) ||
    pathname === APP_ROUTES.app.financeTransactionNew ||
    pathname === APP_ROUTES.app.financeTransferNew ||
    /^\/finance\/transactions\/[^/]+\/edit$/.test(pathname) ||
    /^\/finance\/transactions\/[^/]+$/.test(pathname)
  )
}

export function FinanceAuthenticatedPage({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { setConfig, resetConfig } = useHeaderContext()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthGuard()
  const { isEnabled, isProfileLoading } = useFinanceEnabled()
  const secondaryView = isFinanceSecondaryView(pathname)

  useLayoutEffect(() => {
    if (secondaryView) return
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
              Activa el módulo en Ajustes para ver cuentas, movimientos y
              resumen. Hasta entonces no se llama al API de finanzas.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={SETTINGS_FINANCE_HREF}>Activar en Ajustes</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return <FinanceLayout>{children}</FinanceLayout>
}
