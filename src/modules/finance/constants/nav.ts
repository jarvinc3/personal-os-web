import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import type { ModuleAppNav, ModuleNavItem } from "@/src/shared/types/module-nav";
import {
  ArrowLeftRight,
  BarChart3Icon,
  LandmarkIcon,
  LayoutDashboard,
  Target
} from "lucide-react";

export const FINANCE_NAV_ITEMS: ModuleNavItem[] = [
  {
    label: "Resumen",
    href: APP_ROUTES.app.finance,
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    label: "Movimientos",
    href: APP_ROUTES.app.financeTransactions,
    icon: ArrowLeftRight,
  },
  {
    label: "Estadísticas",
    href: APP_ROUTES.app.financeStatistics,
    icon: BarChart3Icon,
    showInTabBar: false,
  },
  {
    label: "Planificación",
    href: APP_ROUTES.app.financePlanning,
    icon: Target,
  },
  {
    label: "Cuentas",
    href: APP_ROUTES.app.financeAccounts,
    icon: LandmarkIcon,
    extraActiveHrefs: [
      APP_ROUTES.app.financeCategories,
      APP_ROUTES.app.financeSync,
      `${APP_ROUTES.app.financeSync}/oauth`,
    ],
  },
]

export const FINANCE_APP_NAV: ModuleAppNav = {
  slug: "finance",
  rootHref: APP_ROUTES.app.finance,
  label: "Finanzas",
  icon: LandmarkIcon,
  items: FINANCE_NAV_ITEMS,
}
