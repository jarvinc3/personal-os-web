import { redirect } from "next/navigation"

import { APP_ROUTES } from "@/src/shared/constants/app-routes"

export default function FinanceStatisticsPage() {
  redirect(APP_ROUTES.app.financeTransactions)
}
