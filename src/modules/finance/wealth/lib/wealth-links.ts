import type { FinanceBalanceSheetLine } from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

/** Detail route for a breakdown line, or null when the target is incomplete. */
export function wealthLineHref(line: FinanceBalanceSheetLine): string | null {
  if (line.kind === "RECEIVABLE") {
    return APP_ROUTES.app.financeReceivable(line.id)
  }
  if (line.kind === "LOAN") {
    return APP_ROUTES.app.financeLoan(line.id)
  }
  if (line.kind === "CREDIT_CARD") {
    return line.institutionId
      ? APP_ROUTES.app.financeInstitutionCard(line.institutionId, line.id)
      : null
  }
  return line.institutionId
    ? APP_ROUTES.app.financeInstitutionAccount(line.institutionId, line.id)
    : APP_ROUTES.app.financeCashAccount(line.id)
}
