import { isCashInstitution } from "@/src/modules/finance/shared/lib/cash"
import {
  formatProductCounts,
  formatStackItemBalance,
  institutionBalanceLines,
  institutionInitials,
  type InstitutionIrregularities,
  type InstitutionStackCounts,
  type InstitutionStackItem,
} from "@/src/modules/finance/shared/lib/institution-stack"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

const FALLBACK_INSTITUTION_COLOR = "#1B4332"
const FALLBACK_CASH_COLOR = "#334155"

const NO_IRREGULARITIES: InstitutionIrregularities = {
  drift: false,
  reconciliation: false,
}

/** Counts a compact card can show; missing counts stay out of the row. */
export type InstitutionCardCounts = {
  accounts: number
  cards?: number
  loans?: number
}

/** Everything a card paints, with no reference to how the stack is arranged. */
export type InstitutionCardModel = {
  kind: "institution" | "cash"
  name: string
  monogram: string
  logoUrl: string | null
  color: string
  isCash: boolean
  productSummary: string
  counts: InstitutionCardCounts | null
  balanceLabel: string
  balanceAmount: string
  /** Native balance per currency; multiple lines are never converted. */
  balanceLines: Array<{ currency: string; amount: string }>
  irregularities: InstitutionIrregularities
}

export function institutionCardName(item: InstitutionStackItem): string {
  return item.kind === "institution" ? item.institution.name : item.account.name
}

export function buildInstitutionCard(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay
): InstitutionCardModel {
  const balanceLines = institutionBalanceLines({ item, display })

  if (item.kind === "institution") {
    return {
      kind: "institution",
      name: institutionCardName(item),
      monogram: institutionInitials(item.institution.name),
      logoUrl: item.institution.logoUrl,
      color: item.institution.color ?? FALLBACK_INSTITUTION_COLOR,
      isCash: isCashInstitution(item.institution),
      productSummary: formatProductCounts(item.counts),
      counts: item.counts,
      balanceLabel:
        balanceLines.length > 1 ? "Patrimonio por moneda" : "Patrimonio",
      balanceAmount: formatStackItemBalance(item, display),
      balanceLines,
      irregularities: item.irregularities,
    }
  }

  return {
    kind: "cash",
    name: institutionCardName(item),
    monogram: institutionInitials(item.account.name),
    logoUrl: item.account.institutionLogoUrl ?? null,
    color: item.account.color ?? FALLBACK_CASH_COLOR,
    isCash: true,
    productSummary: "Cuenta de dinero en efectivo",
    counts: null,
    balanceLabel: "Saldo",
    balanceAmount: formatStackItemBalance(item, display),
    balanceLines,
    irregularities: item.irregularities,
  }
}

type CatalogInstitutionCardInput = {
  institution: FinanceInstitution
  counts?: InstitutionCardCounts | null
  balanceLabel?: string
  balanceAmount?: string
  balanceLines?: InstitutionCardModel["balanceLines"]
}

/**
 * Card for a catalog institution that carries no products or balances, as in
 * the selectors; the caller opts in to counts and balance lines.
 */
export function buildInstitutionCardFromCatalog({
  institution,
  counts = null,
  balanceLabel = "Balance",
  balanceAmount = "",
  balanceLines = [],
}: CatalogInstitutionCardInput): InstitutionCardModel {
  return {
    kind: "institution",
    name: institution.name,
    monogram: institutionInitials(institution.name),
    logoUrl: institution.logoUrl,
    color: institution.color ?? FALLBACK_INSTITUTION_COLOR,
    isCash: isCashInstitution(institution),
    productSummary: "",
    counts,
    balanceLabel,
    balanceAmount,
    balanceLines,
    irregularities: NO_IRREGULARITIES,
  }
}

/** Loose cash account as a destination: same card, banknote badge. */
export function buildCashCardFromAccount(
  account: FinanceAccount
): InstitutionCardModel {
  return {
    kind: "cash",
    name: account.name,
    monogram: institutionInitials(account.name),
    logoUrl: null,
    color: account.color ?? FALLBACK_CASH_COLOR,
    isCash: true,
    productSummary: "",
    counts: null,
    balanceLabel: "Saldo",
    balanceAmount: "",
    balanceLines: [],
    irregularities: NO_IRREGULARITIES,
  }
}

export type { InstitutionStackCounts }

/** Card for an aggregate or placeholder option that is not a catalog institution. */
export function buildPlainInstitutionCard({
  name,
  color,
  balanceLabel = "Balance",
  balanceAmount = "",
  balanceLines = [],
}: {
  name: string
  color: string
  balanceLabel?: string
  balanceAmount?: string
  balanceLines?: InstitutionCardModel["balanceLines"]
}): InstitutionCardModel {
  return {
    kind: "institution",
    name,
    monogram: institutionInitials(name),
    logoUrl: null,
    color,
    isCash: false,
    productSummary: "",
    counts: null,
    balanceLabel,
    balanceAmount,
    balanceLines,
    irregularities: NO_IRREGULARITIES,
  }
}
