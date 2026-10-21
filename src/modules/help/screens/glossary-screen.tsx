"use client"

import { GlossaryEntry } from "@/src/modules/help/components/glossary-entry"
import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import {
  HELP_TERMS,
  HELP_TERM_CATEGORIES,
} from "@/src/modules/help/constants/glossary"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import { useHelpBack } from "@/src/modules/help/hooks/use-help-back"
import {
  filterHelpTerms,
  findHelpTerm,
  groupHelpTerms,
  hasHelpSearch,
  parseHelpTermParam,
} from "@/src/modules/help/lib/help-search"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { SearchIcon, SearchXIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

function termCountLabel(count: number): string {
  return count === 1 ? "1 término" : `${count} términos`
}

export function GlossaryScreen() {
  const searchParams = useSearchParams()
  const termSlug = parseHelpTermParam(searchParams.get("term"))
  const activeTerm = findHelpTerm(HELP_TERMS, termSlug)
  const [search, setSearch] = useState("")
  const back = useHelpBack(APP_ROUTES.app.help)
  const searching = hasHelpSearch(search)
  const filteredTerms = filterHelpTerms(HELP_TERMS, search)
  const groups = groupHelpTerms({
    terms: filteredTerms,
    categories: HELP_TERM_CATEGORIES,
  })

  usePageHeader(
    {
      variant: "secondary",
      title: "Glosario",
      accentColor: HELP_ACCENT,
      onBack: back,
    },
    [back]
  )

  useEffect(() => {
    if (!activeTerm) {
      return
    }
    document
      .getElementById(`termino-${activeTerm.slug}`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [activeTerm])

  return (
    <HelpPage>
      <div className="sticky top-0 z-10 flex flex-col gap-2 bg-background/95 py-2 backdrop-blur">
        <FormTextField
          icon={SearchIcon}
          type="search"
          value={search}
          onChange={setSearch}
          placeholder="Buscar"
          ariaLabel="Buscar en el glosario"
          autoComplete="off"
        />
        <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
          {searching
            ? `${termCountLabel(filteredTerms.length)} para «${search.trim()}»`
            : termCountLabel(filteredTerms.length)}
        </p>
      </div>

      {groups.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>Ningún término coincide</EmptyTitle>
            <EmptyDescription>
              Prueba con otra palabra o borra la búsqueda.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groups.map((group) => (
          <SettingsSection key={group.category} title={group.label}>
            <div className="flex flex-col divide-y divide-border/60">
              {group.terms.map((term) => (
                <GlossaryEntry
                  key={term.slug}
                  term={term}
                  highlighted={term.slug === activeTerm?.slug}
                  onTermPress={() => setSearch("")}
                />
              ))}
            </div>
          </SettingsSection>
        ))
      )}
    </HelpPage>
  )
}
