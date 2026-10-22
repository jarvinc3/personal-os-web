"use client"

import { HelpFaqList } from "@/src/modules/help/components/faq-list"
import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import { HELP_FAQ_GROUPS } from "@/src/modules/help/constants/faq"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import { useHelpBack } from "@/src/modules/help/hooks/use-help-back"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function FaqScreen() {
  const back = useHelpBack(APP_ROUTES.app.help)

  usePageHeader(
    {
      variant: "secondary",
      title: "Preguntas frecuentes",
      accentColor: HELP_ACCENT,
      onBack: back,
    },
    [back]
  )

  return (
    <HelpPage>
      <p className="px-1 text-sm text-muted-foreground">
        Toca una pregunta para ver la respuesta. Los enlaces llevan al glosario
        o a la guía que lo explica.
      </p>

      {HELP_FAQ_GROUPS.map((group) => (
        <HelpFaqList key={group.slug} group={group} />
      ))}
    </HelpPage>
  )
}
