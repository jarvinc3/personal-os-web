"use client"

import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import {
  HELP_GUIDES,
  HELP_GUIDE_GROUPS,
} from "@/src/modules/help/constants/guides"
import { useHelpBack } from "@/src/modules/help/hooks/use-help-back"
import { helpGuideHref } from "@/src/modules/help/lib/help-links"
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
  BellIcon,
  BookOpenIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FileTextIcon,
  HandCoinsIcon,
  LandmarkIcon,
  MonitorIcon,
  PiggyBankIcon,
  RepeatIcon,
  RocketIcon,
  ScaleIcon,
  SmartphoneIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

const GUIDE_ICONS: Record<string, LucideIcon> = {
  "instalar-android": SmartphoneIcon,
  "instalar-iphone": SmartphoneIcon,
  "instalar-escritorio": MonitorIcon,
  "primeros-pasos": RocketIcon,
  "conciliar-una-cuenta": ScaleIcon,
  "importar-un-estado-de-cuenta": FileTextIcon,
  presupuestos: WalletIcon,
  "metas-de-ahorro": PiggyBankIcon,
  prestamos: LandmarkIcon,
  cobros: HandCoinsIcon,
  "tarjetas-de-credito": CreditCardIcon,
  suscripciones: RepeatIcon,
  notificaciones: BellIcon,
}

export function GuidesScreen() {
  const back = useHelpBack(APP_ROUTES.app.help)
  const { navigate, isPending } = usePendingNavigation()

  usePageHeader(
    {
      variant: "secondary",
      title: "Guías",
      accentColor: HELP_ACCENT,
      onBack: back,
    },
    [back]
  )

  return (
    <HelpPage>
      {HELP_GUIDE_GROUPS.map((group) => {
        const guides = HELP_GUIDES.filter((guide) => guide.group === group.id)
        return (
          <section key={group.id} className="flex flex-col gap-2">
            <div className="flex min-w-0 flex-col gap-0.5 px-1">
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
            </div>
            <Card className="gap-0 bg-card p-1">
              <ItemGroup className="gap-0 divide-y divide-border/60">
                {guides.map((guide) => {
                  const GuideIcon = GUIDE_ICONS[guide.slug] ?? BookOpenIcon
                  return (
                    <Item
                      key={guide.slug}
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
                          onClick={() => navigate(helpGuideHref(guide.slug))}
                        />
                      }
                    >
                      <ItemMedia
                        className="size-9 rounded-md"
                        style={{ backgroundColor: `${HELP_ACCENT}20` }}
                      >
                        <GuideIcon
                          className="size-4.5"
                          style={{ color: HELP_ACCENT }}
                        />
                      </ItemMedia>
                      <ItemContent className="gap-0.5">
                        <ItemTitle className="text-sm font-normal md:text-base">
                          {guide.title}
                        </ItemTitle>
                        <ItemDescription className="text-xs">
                          {guide.summary}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <ChevronRightIcon className="size-4.5 text-muted-foreground" />
                      </ItemActions>
                    </Item>
                  )
                })}
              </ItemGroup>
            </Card>
          </section>
        )
      })}
    </HelpPage>
  )
}
