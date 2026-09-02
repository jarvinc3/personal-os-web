import { APP_ROUTES } from "@/src/shared/constants/app-routes"

export const FINANCE_NAV_ITEMS = [
  { label: "Resumen", href: APP_ROUTES.app.finance, ready: true },
  { label: "Cuentas", href: APP_ROUTES.app.financeAccounts, ready: true },
  { label: "Movimientos", href: APP_ROUTES.app.financeTransactions, ready: true },
  { label: "Presupuestos", href: APP_ROUTES.app.finance, ready: false },
  { label: "Planificación", href: APP_ROUTES.app.finance, ready: false },
  { label: "Sincronizar", href: APP_ROUTES.app.finance, ready: false },
] as const

export { FINANCE_QUERY_KEY } from "@/src/modules/finance/types/api"
