"use client"

import { HelpRichText } from "@/src/modules/help/components/help-rich-text"
import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import { HELP_GUIDES } from "@/src/modules/help/constants/guides"
import { useHelpBack } from "@/src/modules/help/hooks/use-help-back"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { BookOpenIcon } from "lucide-react"
import { useRouter } from "next/navigation"

type HelpGuideScreenProps = {
  slug: string
}

export function HelpGuideScreen({ slug }: HelpGuideScreenProps) {
  const router = useRouter()
  const guide = HELP_GUIDES.find((item) => item.slug === slug) ?? null
  const back = useHelpBack(APP_ROUTES.app.helpGuides)

  usePageHeader(
    {
      variant: "secondary",
      title: guide?.title ?? "Guía",
      accentColor: HELP_ACCENT,
      onBack: back,
    },
    [back, guide?.title]
  )

  if (!guide) {
    return (
      <HelpPage>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenIcon />
            </EmptyMedia>
            <EmptyTitle>Esta guía no existe</EmptyTitle>
            <EmptyDescription>
              Puede que haya cambiado de nombre o que el enlace esté incompleto.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              type="button"
              onClick={() => router.push(APP_ROUTES.app.helpGuides)}
            >
              <BookOpenIcon className="size-4 shrink-0" />
              Ver todas las guías
            </Button>
          </EmptyContent>
        </Empty>
      </HelpPage>
    )
  }

  return (
    <HelpPage>
      <p className="px-1 text-sm text-muted-foreground">{guide.summary}</p>

      <ol className="flex list-none flex-col gap-3">
        {guide.steps.map((step, index) => (
          <li key={step.title}>
            <SummarySection
              title={step.title}
              right={
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${HELP_ACCENT}1A`,
                    color: HELP_ACCENT,
                  }}
                  aria-hidden
                >
                  {index + 1}
                </span>
              }
            >
              <p className="px-1 pb-1 text-sm text-muted-foreground">
                <HelpRichText text={step.body} />
              </p>
            </SummarySection>
          </li>
        ))}
      </ol>
    </HelpPage>
  )
}
