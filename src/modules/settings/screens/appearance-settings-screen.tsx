"use client"

import { EditAppearanceStyleSheet } from "@/src/modules/settings/components/sheets/edit-appearance-style-sheet"
import { EditPrimaryColorSheet } from "@/src/modules/settings/components/sheets/edit-primary-color-sheet"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditThemeSheet } from "@/src/modules/settings/components/sheets/edit-theme-sheet"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import {
  getThemeOptionLabel,
  SETTINGS_REGISTRY,
} from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { getSettingValue } from "@/src/modules/settings/lib/settings-value"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import type { ThemeValue } from "@/src/modules/settings/types/profile.types"
import { findAppearanceStyle, findPrimaryColor } from "@/src/shared/appearance"
import { usePendingNavigation } from "@/src/shared/components/shell/navigation-pending"
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
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  ChevronRightIcon,
  ComponentIcon,
  GalleryVerticalEndIcon,
} from "lucide-react"

const APPEARANCE = SETTINGS_REGISTRY.appearance
const ThemeIcon = APPEARANCE.rows.theme.icon
const StyleIcon = APPEARANCE.rows.style.icon
const PrimaryColorIcon = APPEARANCE.rows.primaryColor.icon
const REFERENCE_ROWS = [
  {
    key: "cards",
    label: "Galería de cards",
    description: "Cada entidad con sus variantes.",
    icon: GalleryVerticalEndIcon,
    href: APP_ROUTES.app.settingsAppearanceCards,
  },
  {
    key: "components",
    label: "Galería de componentes",
    description: "Los componentes compartidos, con datos de ejemplo.",
    icon: ComponentIcon,
    href: APP_ROUTES.app.settingsAppearanceComponents,
  },
]

export function AppearanceSettingsScreen() {
  return (
    <SettingsGate>
      <AppearanceSettingsScreenBody />
    </SettingsGate>
  )
}

function AppearanceSettingsScreenBody() {
  const { preferences } = useProfile()
  const { navigate, isPending } = usePendingNavigation()
  const { open: openThemeSheet, setOpen: setOpenThemeSheet } = useSheetParam(
    SETTINGS_SHEET_KEYS.theme
  )
  const { open: openStyleSheet, setOpen: setOpenStyleSheet } = useSheetParam(
    SETTINGS_SHEET_KEYS.style
  )
  const { open: openColorSheet, setOpen: setOpenColorSheet } = useSheetParam(
    SETTINGS_SHEET_KEYS.primaryColor
  )
  const themeValue = getSettingValue<ThemeValue>(preferences.theme)
  const { style, primaryColor } = preferences.theme
  const styleOption = findAppearanceStyle(style)
  const colorOption = findPrimaryColor(primaryColor)

  const appearanceRows = [
    {
      key: "theme",
      label: "Modo",
      description: "Claro, oscuro o el que use el dispositivo.",
      value: getThemeOptionLabel(themeValue),
      icon: ThemeIcon,
      onPress: () => setOpenThemeSheet(true),
      trailing: null,
    },
    {
      key: "style",
      label: "Estilo visual",
      description: "Formas, bordes y sombras de la interfaz.",
      value: styleOption?.label ?? style,
      icon: StyleIcon,
      onPress: () => setOpenStyleSheet(true),
      trailing: null,
    },
    {
      key: "primaryColor",
      label: "Color primario",
      description: "Botones, enlaces y acentos de la app.",
      value: colorOption?.label ?? primaryColor,
      icon: PrimaryColorIcon,
      onPress: () => setOpenColorSheet(true),
      trailing: (
        <span
          aria-hidden
          className="size-5 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: primaryColor }}
        />
      ),
    },
  ]

  return (
    <SettingsSecondaryPage title="Apariencia">
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Apariencia
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {appearanceRows.map(
              ({
                key,
                label,
                description,
                value,
                icon: Icon,
                onPress,
                trailing,
              }) => (
                <Item
                  key={key}
                  variant="plain"
                  className="min-h-[52px] px-3 py-3"
                  render={<button type="button" onClick={onPress} />}
                >
                  <ItemMedia
                    className="size-9 rounded-md"
                    style={{ backgroundColor: `${APPEARANCE.accent}20` }}
                  >
                    <Icon
                      className="size-4.5"
                      style={{ color: APPEARANCE.accent }}
                    />
                  </ItemMedia>
                  <ItemContent className="gap-0.5">
                    <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                      <ItemTitle className="text-sm font-normal md:text-base">
                        {label}
                      </ItemTitle>
                      <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                        {value}
                      </ItemDescription>
                    </div>
                    <ItemDescription className="text-xs">
                      {description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {trailing}
                    <ChevronRightIcon className="size-4.5 text-muted-foreground" />
                  </ItemActions>
                </Item>
              )
            )}
          </ItemGroup>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Referencia
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {REFERENCE_ROWS.map(
              ({ key, label, description, icon: Icon, href }) => (
                <Item
                  key={key}
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
                    style={{ backgroundColor: `${APPEARANCE.accent}20` }}
                  >
                    <Icon
                      className="size-4.5"
                      style={{ color: APPEARANCE.accent }}
                    />
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
              )
            )}
          </ItemGroup>
        </Card>
      </section>

      <EditThemeSheet open={openThemeSheet} onOpenChange={setOpenThemeSheet} />
      <EditAppearanceStyleSheet
        open={openStyleSheet}
        onOpenChange={setOpenStyleSheet}
      />
      <EditPrimaryColorSheet
        open={openColorSheet}
        onOpenChange={setOpenColorSheet}
      />
    </SettingsSecondaryPage>
  )
}
