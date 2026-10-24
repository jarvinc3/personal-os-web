"use client"

import { HelpPage } from "@/src/modules/help/components/layout/help-page"
import { HELP_ACCENT } from "@/src/modules/help/constants/help-ui"
import {
  HELP_GUIDES,
  HELP_GUIDE_GROUPS,
} from "@/src/modules/help/constants/guides"
import { useHelpBack } from "@/src/modules/help/hooks/use-help-back"
import { helpGuideHref } from "@/src/modules/help/lib/help-links"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  BellIcon,
  BookOpenIcon,
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
          <SettingsSection
            key={group.id}
            title={group.title}
            description={group.description}
          >
            {guides.map((guide, index) => (
              <SettingsRow
                key={guide.slug}
                label={guide.title}
                description={guide.summary}
                icon={GUIDE_ICONS[guide.slug] ?? BookOpenIcon}
                accentColor={HELP_ACCENT}
                disabled={isPending}
                onPress={() => navigate(helpGuideHref(guide.slug))}
                isLast={index === guides.length - 1}
              />
            ))}
          </SettingsSection>
        )
      })}
    </HelpPage>
  )
}
