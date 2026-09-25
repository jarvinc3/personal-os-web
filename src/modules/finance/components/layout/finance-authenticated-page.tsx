"use client"

import { useAuthGuard } from "@/src/modules/auth";
import { FinanceLayout } from "@/src/modules/finance/components/layout/finance-layout";
import { financeSectionTitle } from "@/src/modules/finance/constants/nav";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { MODULE_SHEET_PARAM_KEYS } from "@/src/modules/settings/constants/module-sheet-keys";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import { Button } from "@/src/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { useHeaderContext } from "@/src/shared/context/header-context";
import { BarChart3Icon, LandmarkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, type ReactNode } from "react";

const SETTINGS_FINANCE_HREF = `${APP_ROUTES.app.settings}?sheet=${MODULE_SHEET_PARAM_KEYS.finance}`

const STATISTICS_SHORTCUT_PATHS = new Set<string>([
  APP_ROUTES.app.financePlanning,
  APP_ROUTES.app.financeAccounts,
  APP_ROUTES.app.financeTransactions,
])

function isFinanceAccountsDetail(pathname: string): boolean {
  return (
    pathname === APP_ROUTES.app.financeCategories ||
    pathname === APP_ROUTES.app.financeSync ||
    pathname.startsWith(`${APP_ROUTES.app.financeAccounts}/institutions/`) ||
    pathname.startsWith(`${APP_ROUTES.app.financeAccounts}/cash/`)
  )
}

export function FinanceAuthenticatedPage({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setConfig, resetConfig } = useHeaderContext()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthGuard()
  const { isEnabled, isProfileLoading } = useFinanceEnabled()
  const accountsDetail = isFinanceAccountsDetail(pathname)
  const statisticsAction = useMemo(() => {
    if (!STATISTICS_SHORTCUT_PATHS.has(pathname)) return undefined
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full size-9 shrink-0"
        asChild
      >
        <Link href={APP_ROUTES.app.financeStatistics} aria-label="Estadísticas">
          <BarChart3Icon />
        </Link>
      </Button>
    )
  }, [pathname])

  useLayoutEffect(() => {
    if (accountsDetail) return
    setConfig({
      title: financeSectionTitle(pathname) ?? "Finanzas",
      actions: statisticsAction,
    })
  }, [accountsDetail, pathname, setConfig, statisticsAction])

  useLayoutEffect(() => {
    return () => {
      if (!accountsDetail) {
        resetConfig()
      }
    }
  }, [accountsDetail, resetConfig])

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
