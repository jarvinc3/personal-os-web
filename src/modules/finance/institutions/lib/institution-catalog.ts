import type { FinanceInstitutionType } from "@/src/modules/finance/shared/constants/catalog"

export type InstitutionCatalogEntry = {
  name: string
  domain: string
  type: FinanceInstitutionType
  country: string
  color: string
}

export const INSTITUTION_CATALOG_FILTERS = [
  { value: "bank", label: "Bancos" },
  { value: "digital_wallet", label: "Fintech" },
  { value: "credit_union", label: "Cooperativas" },
] as const

export type InstitutionCatalogFilter =
  (typeof INSTITUTION_CATALOG_FILTERS)[number]["value"]

/** Curated starting point for Dominican users; the brand search covers the rest. */
export const POPULAR_INSTITUTIONS: InstitutionCatalogEntry[] = [
  {
    name: "Banreservas",
    domain: "banreservas.com",
    type: "bank",
    country: "DO",
    color: "#C8102E",
  },
  {
    name: "Banco Popular",
    domain: "bancopopular.com.do",
    type: "bank",
    country: "DO",
    color: "#1B3A8C",
  },
  {
    name: "Banco BHD",
    domain: "bhd.com.do",
    type: "bank",
    country: "DO",
    color: "#0F9D58",
  },
  {
    name: "Qik",
    domain: "qik.do",
    type: "digital_wallet",
    country: "DO",
    color: "#F26A1B",
  },
  {
    name: "Asociación Popular",
    domain: "apap.com.do",
    type: "bank",
    country: "DO",
    color: "#0066B3",
  },
  {
    name: "Banco Santa Cruz",
    domain: "bancosantacruz.com.do",
    type: "bank",
    country: "DO",
    color: "#B71C1C",
  },
]

export function filterCatalog(
  entries: readonly InstitutionCatalogEntry[],
  filter: InstitutionCatalogFilter
): InstitutionCatalogEntry[] {
  return entries.filter((entry) => entry.type === filter)
}
