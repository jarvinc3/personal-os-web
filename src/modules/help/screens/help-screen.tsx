"use client"

import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import { usePendingNavigation } from "@/src/shared/components/shell/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  BookOpenIcon,
  MessageCircleQuestionIcon,
  RouteIcon,
} from "lucide-react"

const HELP_SECTIONS = [
  {
    label: "Glosario",
    description: "Los términos de la app, explicados.",
    icon: BookOpenIcon,
    href: APP_ROUTES.app.helpGlossary,
  },
  {
    label: "Guías",
    description: "Cómo instalar la app y cómo hacer cada tarea.",
    icon: RouteIcon,
    href: APP_ROUTES.app.helpGuides,
  },
  {
    label: "Preguntas frecuentes",
    description: "Respuestas cortas agrupadas por tema.",
    icon: MessageCircleQuestionIcon,
    href: APP_ROUTES.app.helpFaq,
  },
] as const

export function HelpScreen() {
  usePageHeader({ title: "Centro de ayuda" })
  const { navigate, isPending } = usePendingNavigation()

  return (
    <HelpPage>
      <p className="px-1 text-sm text-muted-foreground">
        Consulta qué significa cada concepto y cómo se hace una tarea, sin salir
        de la app.
      </p>

      <SettingsSection title="Contenido">
        {HELP_SECTIONS.map((section, index) => (
          <SettingsRow
            key={section.href}
            label={section.label}
            description={section.description}
            icon={section.icon}
            accentColor={HELP_ACCENT}
            disabled={isPending}
            onPress={() => navigate(section.href)}
            isLast={index === HELP_SECTIONS.length - 1}
          />
        ))}
      </SettingsSection>
    </HelpPage>
  )
}
