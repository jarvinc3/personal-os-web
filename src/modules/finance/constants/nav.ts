import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import type { ModuleAppNav, ModuleNavItem } from "@/src/shared/types/module-nav";
import {
  ArrowLeftRight,
  LandmarkIcon,
  Target
} from "lucide-react";

export const FINANCE_NAV_ITEMS: ModuleNavItem[] = [
  {
    label: "Movimientos",
    href: APP_ROUTES.app.financeTransactions,
    icon: ArrowLeftRight,
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

export function financeSectionTitle(pathname: string): string | null {
  const items = [...FINANCE_NAV_ITEMS].sort(
    (left, right) => right.href.length - left.href.length,
  )

  for (const item of items) {
    if (pathname === item.href) return item.label
    if (!item.matchExact && pathname.startsWith(`${item.href}/`)) {
      return item.label
    }
  }

  return null
}
