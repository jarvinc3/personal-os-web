import { isCashInstitution } from "@/src/modules/finance/shared/lib/cash"
import {
  formatProductCounts,
  formatStackItemBalance,
  institutionInitials,
  type InstitutionStackCounts,
  type InstitutionStackItem,
} from "@/src/modules/finance/shared/lib/institution-stack"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"

const FALLBACK_INSTITUTION_COLOR = "#1B4332"
const FALLBACK_CASH_COLOR = "#334155"

/** Everything a card paints, with no reference to how the stack is arranged. */
export type InstitutionCardModel = {
  item: InstitutionStackItem
  name: string
  monogram: string
  logoUrl: string | null
  color: string
  isCash: boolean
  productSummary: string
  counts: InstitutionStackCounts | null
  balanceLabel: string
  balanceAmount: string
}

export function institutionCardName(item: InstitutionStackItem): string {
  return item.kind === "institution" ? item.institution.name : item.account.name
}

export function buildInstitutionCard(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay
): InstitutionCardModel {
  if (item.kind === "institution") {
    return {
      item,
      name: institutionCardName(item),
      monogram: institutionInitials(item.institution.name),
      logoUrl: item.institution.logoUrl,
      color: item.institution.color ?? FALLBACK_INSTITUTION_COLOR,
      isCash: isCashInstitution(item.institution),
      productSummary: formatProductCounts(item.counts),
      counts: item.counts,
      balanceLabel: "Balance consolidado",
      balanceAmount: formatStackItemBalance(item, display),
    }
  }

  return {
    item,
    name: institutionCardName(item),
    monogram: institutionInitials(item.account.name),
    logoUrl: item.account.institutionLogoUrl ?? null,
    color: item.account.color ?? FALLBACK_CASH_COLOR,
    isCash: true,
    productSummary: "Cuenta de dinero en efectivo",
    counts: null,
    balanceLabel: "Saldo",
    balanceAmount: formatStackItemBalance(item, display),
  }
}
