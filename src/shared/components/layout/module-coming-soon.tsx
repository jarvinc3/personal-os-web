import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { settingsModuleHref } from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import type { ModuleSlug } from "@/src/shared/types/module-nav"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"

type ModuleComingSoonProps = {
  slug: ModuleSlug
}

export function ModuleComingSoon({ slug }: ModuleComingSoonProps) {
  const moduleDef = getModule(slug)
  const ModuleIcon = moduleDef.icon

  return (
    <div className="mx-auto flex max-w-2xl flex-col p-4 pb-16 md:px-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ModuleIcon style={{ color: moduleDef.accent }} />
          </EmptyMedia>
          <EmptyTitle>{moduleDef.label} está en camino</EmptyTitle>
          <EmptyDescription>
            Todavía estamos construyendo sus pantallas. Puedes activarla y
            ajustarla en Ajustes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href={settingsModuleHref(slug)} className="relative">
              <SettingsIcon className="size-4 shrink-0" />
              Abrir Ajustes
              <LinkPendingOverlay />
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
