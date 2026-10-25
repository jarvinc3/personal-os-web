"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth"
import { MODULE_SHEET_PARAM_KEYS } from "@/src/modules/settings/constants/module-sheet-keys"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar"
import { Badge } from "@/src/shared/components/ui/badge"
import { usePendingNavigation } from "@/src/shared/components/shell/navigation-pending"
import {
  APP_ROUTES,
  settingsModuleHref,
} from "@/src/shared/constants/app-routes"
import { landingUrl } from "@/src/shared/constants/landing.mjs"
import { MODULE_SLUGS_ORDER } from "@/src/shared/constants/module-registry"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import {
  Bell,
  Globe,
  LayoutGrid,
  LogOut,
  Palette,
  ShieldCheck,
  User,
} from "lucide-react"

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"
const APP_ENV =
  process.env.NODE_ENV === "development"
    ? "development"
    : (process.env.NEXT_PUBLIC_ENV ?? "preview")

const LEGACY_SHEET_ROUTES: Record<string, string> = {
  "account-sheet": APP_ROUTES.app.settingsAccount,
  "theme-sheet": APP_ROUTES.app.settingsAppearance,
  "quiet-hours-sheet": APP_ROUTES.app.settingsNotifications,
  "time-zone-sheet": APP_ROUTES.app.settingsRegional,
  "delete-account-sheet": APP_ROUTES.app.settingsPrivacy,
}

const SETTINGS_MENU = [
  {
    label: "Perfil y cuenta",
    description: "Nombre, foto, correo y sesión.",
    icon: User,
    accent: SETTINGS_REGISTRY.account.accent,
    href: APP_ROUTES.app.settingsAccount,
  },
  {
    label: "Preferencias regionales",
    description: "Zona horaria, idioma y moneda.",
    icon: Globe,
    accent: SETTINGS_REGISTRY.account.accent,
    href: APP_ROUTES.app.settingsRegional,
  },
  {
    label: "Apariencia",
    description: "Modo, estilo y color de la app.",
    icon: Palette,
    accent: SETTINGS_REGISTRY.appearance.accent,
    href: APP_ROUTES.app.settingsAppearance,
  },
  {
    label: "Notificaciones",
    description: "Canales, horario silencioso y push.",
    icon: Bell,
    accent: SETTINGS_REGISTRY.notifications.accent,
    href: APP_ROUTES.app.settingsNotifications,
  },
  {
    label: "Privacidad y datos",
    description: "Analíticas, vaciado y eliminación de la cuenta.",
    icon: ShieldCheck,
    accent: SETTINGS_REGISTRY.privacy.accent,
    href: APP_ROUTES.app.settingsPrivacy,
  },
  {
    label: "Apps",
    description: "Ajustes de cada app.",
    icon: LayoutGrid,
    accent: SETTINGS_REGISTRY.account.accent,
    href: APP_ROUTES.app.settingsModules,
  },
] as const

function openLandingPage() {
  window.open(landingUrl(), "_blank", "noopener,noreferrer")
}

export function SettingsScreen() {
  return (
    <SettingsGate>
      <SettingsScreenBody />
    </SettingsGate>
  )
}

function SettingsScreenBody() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthGuard()
  const { logoutMutation } = useAuth()
  const { profileQuery } = useProfile()
  const { navigate, isPending } = usePendingNavigation()
  const profile = profileQuery.data
  const displayName = profile?.fullName ?? user?.fullName ?? "Usuario"
  const displayEmail = profile?.email ?? user?.email ?? ""

  useEffect(() => {
    const sheet = searchParams.get("sheet")
    if (!sheet) {
      return
    }
    const moduleSlug = MODULE_SLUGS_ORDER.find(
      (slug) => MODULE_SHEET_PARAM_KEYS[slug] === sheet
    )
    if (moduleSlug) {
      router.replace(settingsModuleHref(moduleSlug))
      return
    }
    const sectionRoute = LEGACY_SHEET_ROUTES[sheet]
    if (sectionRoute) {
      router.replace(`${sectionRoute}?sheet=${encodeURIComponent(sheet)}`)
    }
  }, [router, searchParams])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-10 md:px-6">
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="size-20 md:size-24">
          {profile?.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="text-base font-semibold">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayEmail}</p>
        </div>
      </div>

      <SettingsSection title="Ajustes">
        {SETTINGS_MENU.map((item, index) => (
          <SettingsRow
            key={item.href}
            label={item.label}
            description={item.description}
            icon={item.icon}
            accentColor={item.accent}
            disabled={isPending}
            onPress={() => navigate(item.href)}
            isLast={index === SETTINGS_MENU.length - 1}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Ayuda">
        <SettingsRow
          label="Centro de ayuda"
          description="Glosario, guías y preguntas frecuentes."
          accentColor={SETTINGS_REGISTRY.help.accent}
          disabled={isPending}
          onPress={() => navigate(APP_ROUTES.app.help)}
          isLast
          {...SETTINGS_REGISTRY.help.rows.center}
        />
      </SettingsSection>

      <SettingsSection title="Información">
        <SettingsRow
          label="Landing page"
          link
          onPress={openLandingPage}
          isLast
          accentColor={SETTINGS_REGISTRY.marketing.accent}
          {...SETTINGS_REGISTRY.marketing.rows.landingPage}
        />
      </SettingsSection>

      <SettingsSection title="Sesión">
        <SettingsRow
          label="Cerrar sesión"
          destructive
          onPress={() => logoutMutation.mutate()}
          showChevron={false}
          trailing={<LogOut className="size-4 text-destructive" />}
          isLast
        />
      </SettingsSection>

      <div className="flex flex-col items-center justify-center gap-1 pb-6">
        <p className="text-xs text-muted-foreground">
          Entorno{" "}
          <span className="font-mono font-bold capitalize">{APP_ENV}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Versión <span className="font-mono font-bold">{APP_VERSION}</span>
        </p>
        <Badge variant="info">Beta</Badge>
      </div>
    </div>
  )
}
