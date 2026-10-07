import { redirect } from "next/navigation"

import { APP_ROUTES } from "@/src/shared/constants/app-routes"

export default function FinancePage() {
  redirect(APP_ROUTES.app.financeTransactions)
}
