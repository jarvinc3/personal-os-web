"use client"

import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import { Card } from "@/src/shared/components/ui/card"
import { cn } from "@/src/shared/lib/utils"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { usePendingNavigation } from "@/src/shared/components/shell/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  BookOpenIcon,
  ChevronRightIcon,
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

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Contenido
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {HELP_SECTIONS.map(({ href, label, description, icon: Icon }) => (
              <Item
                key={href}
                variant="plain"
                className={cn(
                  "min-h-[52px] px-3 py-3",
                  isPending && "opacity-50"
                )}
                aria-disabled={isPending || undefined}
                render={
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => navigate(href)}
                  />
                }
              >
                <ItemMedia
                  className="size-9 rounded-md"
                  style={{ backgroundColor: `${HELP_ACCENT}20` }}
                >
                  <Icon className="size-4.5" style={{ color: HELP_ACCENT }} />
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle className="text-sm font-normal md:text-base">
                    {label}
                  </ItemTitle>
                  <ItemDescription className="text-xs">
                    {description}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4.5 text-muted-foreground" />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </Card>
      </section>
    </HelpPage>
  )
}
