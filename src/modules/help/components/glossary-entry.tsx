"use client"

import { HelpRichText } from "@/src/modules/help/components/help-rich-text"
import { HELP_TERMS } from "@/src/modules/help/constants/glossary"
import { glossaryTermHref } from "@/src/modules/help/lib/help-links"
import type { HelpTerm } from "@/src/modules/help/types/help.types"
import { cn } from "@/src/shared/lib/utils"
import Link from "next/link"

type GlossaryEntryProps = {
  term: HelpTerm
  highlighted: boolean
  onTermPress?: () => void
}

const TERM_BY_SLUG = new Map(HELP_TERMS.map((term) => [term.slug, term]))

export function GlossaryEntry({
  term,
  highlighted,
  onTermPress,
}: GlossaryEntryProps) {
  const related = (term.related ?? []).flatMap((slug) => {
    const match = TERM_BY_SLUG.get(slug)
    return match ? [match] : []
  })

  return (
    <article
      id={`termino-${term.slug}`}
      aria-labelledby={`termino-${term.slug}-titulo`}
      className={cn(
        "scroll-mt-24 rounded-xl px-3 py-3 transition-colors",
        highlighted && "bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <h3
        id={`termino-${term.slug}-titulo`}
        className="text-sm font-semibold text-foreground"
      >
        {term.term}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        <HelpRichText text={term.definition} onNavigate={onTermPress} />
      </p>
      {related.length > 0 ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>Ver también:</span>
          {related.map((item) => (
            <Link
              key={item.slug}
              href={glossaryTermHref(item.slug)}
              onClick={onTermPress}
              className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              {item.term}
            </Link>
          ))}
        </p>
      ) : null}
    </article>
  )
}
