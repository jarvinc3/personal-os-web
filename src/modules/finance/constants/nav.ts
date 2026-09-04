import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import type { ModuleAppNav, ModuleNavItem } from "@/src/shared/types/module-nav"
import {
  ArrowLeftRight,
  LandmarkIcon,
  LayoutDashboard,
  Target,
  Wallet,
} from "lucide-react"

export const FINANCE_NAV_ITEMS: ModuleNavItem[] = [
  {
    label: "Resumen",
    href: APP_ROUTES.app.finance,
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Cuentas",
    href: APP_ROUTES.app.financeAccounts,
    icon: LandmarkIcon,
    extraActiveHrefs: [
      APP_ROUTES.app.financeSync,
      `${APP_ROUTES.app.financeSync}/oauth`,
    ],
  },
  {
    label: "Movimientos",
    href: APP_ROUTES.app.financeTransactions,
    icon: ArrowLeftRight,
  },
  {
    label: "Presupuestos",
    href: APP_ROUTES.app.financeBudgets,
    icon: Wallet,
  },
  {
    label: "Planificación",
    href: APP_ROUTES.app.financePlanning,
    icon: Target,
  },
]

export const FINANCE_APP_NAV: ModuleAppNav = {
  slug: "finance",
  rootHref: APP_ROUTES.app.finance,
  label: "Finanzas",
  icon: LandmarkIcon,
  items: FINANCE_NAV_ITEMS,
}
