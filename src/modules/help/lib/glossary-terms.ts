import { HELP_TERMS } from "@/src/modules/help/constants/glossary"
import type { HelpTerm } from "@/src/modules/help/types/help.types"

const TERM_BY_SLUG = new Map(HELP_TERMS.map((term) => [term.slug, term]))

/** Resuelve slugs en orden, sin repetidos y sin inventar términos ausentes. */
export function glossaryTermsForSlugs(
  slugs: readonly string[]
): readonly HelpTerm[] {
  const seen = new Set<string>()
  const terms: HelpTerm[] = []
  for (const slug of slugs) {
    if (seen.has(slug)) {
      continue
    }
    seen.add(slug)
    const term = TERM_BY_SLUG.get(slug)
    if (term) {
      terms.push(term)
    }
  }
  return terms
}
