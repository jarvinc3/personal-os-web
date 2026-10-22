import { foldSearchText } from "@/src/shared/lib/search-text"
import type {
  HelpTerm,
  HelpTermCategoryId,
} from "@/src/modules/help/types/help.types"

export type HelpTermGroup = {
  category: HelpTermCategoryId
  label: string
  terms: readonly HelpTerm[]
}

type HelpTermCategory = {
  id: HelpTermCategoryId
  label: string
}

export function hasHelpSearch(query: string): boolean {
  return foldSearchText(query).length > 0
}

export function filterHelpTerms(
  terms: readonly HelpTerm[],
  query: string
): readonly HelpTerm[] {
  const needle = foldSearchText(query)
  if (!needle) {
    return terms
  }

  return terms.filter((term) => {
    const haystack = [term.term, ...(term.aliases ?? []), term.definition].map(
      foldSearchText
    )
    return haystack.some((value) => value.includes(needle))
  })
}

export function groupHelpTerms({
  terms,
  categories,
}: {
  terms: readonly HelpTerm[]
  categories: readonly HelpTermCategory[]
}): readonly HelpTermGroup[] {
  return categories
    .map((category) => ({
      category: category.id,
      label: category.label,
      terms: terms.filter((term) => term.category === category.id),
    }))
    .filter((group) => group.terms.length > 0)
}

export function findHelpTerm(
  terms: readonly HelpTerm[],
  slug: string | null | undefined
): HelpTerm | null {
  const cleanSlug = parseHelpTermParam(slug)
  if (!cleanSlug) {
    return null
  }

  return terms.find((term) => term.slug === cleanSlug) ?? null
}

export function parseHelpTermParam(
  value: string | null | undefined
): string | null {
  const slug = value?.trim().toLowerCase() ?? ""
  return slug.length > 0 ? slug : null
}
