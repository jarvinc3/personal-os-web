"use client"

import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditLocaleSheet } from "@/src/modules/settings/components/sheets/edit-locale-sheet"
import { EditTimeZoneSheet } from "@/src/modules/settings/components/sheets/edit-time-zone-sheet"
import { EditWeekStartSheet } from "@/src/modules/settings/components/sheets/edit-week-start-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { useWeekStartsOn } from "@/src/modules/settings/hooks/use-week-starts-on"
import {
  DEFAULT_LOCALE,
  localeLabel,
} from "@/src/modules/settings/lib/locale-options"
import { weekStartsOnLabel } from "@/src/modules/settings/lib/week-starts-on"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { settingsModuleHref } from "@/src/shared/constants/app-routes"
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
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ChevronRightIcon, Coins, Globe } from "lucide-react"

const REGIONAL_ACCENT = SETTINGS_REGISTRY.account.accent
const TimeZoneIcon = SETTINGS_REGISTRY.account.rows.timeZone.icon
const WeekStartIcon = SETTINGS_REGISTRY.account.rows.weekStartsOn.icon

export function RegionalSettingsScreen() {
  return (
    <SettingsGate>
      <RegionalSettingsScreenBody />
    </SettingsGate>
  )
}

function RegionalSettingsScreenBody() {
  const { profileQuery, preferences } = useProfile()
  const { config } = useUserModuleConfig("finance")
  const { navigate, isPending } = usePendingNavigation()
  const { open: openTimeZoneSheet, setOpen: setOpenTimeZoneSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.timeZone)
  const { open: openLocaleSheet, setOpen: setOpenLocaleSheet } = useSheetParam(
    SETTINGS_SHEET_KEYS.locale
  )
  const { open: openWeekStartSheet, setOpen: setOpenWeekStartSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.weekStart)

  const profile = profileQuery.data
  const timeZone = profile?.timezone?.trim() || "Sin definir"
  const locale = localeLabel(profile?.locale)
  const storedWeekStart = preferences.regional.weekStartsOn
  const weekStart = useWeekStartsOn()
  const weekStartValue =
    storedWeekStart === null
      ? `${weekStartsOnLabel(weekStart)} (según la región)`
      : weekStartsOnLabel(weekStart)

  const regionRows = [
    {
      key: "timeZone",
      label: "Zona horaria",
      description: "Las fechas y horas se muestran en esta zona.",
      value: timeZone,
      icon: TimeZoneIcon,
      onPress: () => setOpenTimeZoneSheet(true),
    },
    {
      key: "locale",
      label: "Idioma",
      description: "Idioma y formatos regionales de la app.",
      value: locale,
      icon: Globe,
      onPress: () => setOpenLocaleSheet(true),
    },
    {
      key: "weekStartsOn",
      label: "Primer día de la semana",
      description: "Se usa en calendarios y en las semanas de la app.",
      value: weekStartValue,
      icon: WeekStartIcon,
      onPress: () => setOpenWeekStartSheet(true),
    },
  ]

  return (
    <SettingsSecondaryPage title="Preferencias regionales">
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Región
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {regionRows.map(
              ({ key, label, description, value, icon: Icon, onPress }) => (
                <Item
                  key={key}
                  variant="plain"
                  className="min-h-[52px] px-3 py-3"
                  render={<button type="button" onClick={onPress} />}
                >
                  <ItemMedia
                    className="size-9 rounded-md"
                    style={{ backgroundColor: `${REGIONAL_ACCENT}20` }}
                  >
                    <Icon
                      className="size-4.5"
                      style={{ color: REGIONAL_ACCENT }}
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
          Moneda
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0">
            <Item
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
                  onClick={() => navigate(settingsModuleHref("finance"))}
                />
              }
            >
              <ItemMedia
                className="size-9 rounded-md"
                style={{ backgroundColor: `${REGIONAL_ACCENT}20` }}
              >
                <Coins
                  className="size-4.5"
                  style={{ color: REGIONAL_ACCENT }}
                />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                  <ItemTitle className="text-sm font-normal md:text-base">
                    Moneda por defecto
                  </ItemTitle>
                  <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                    {config.baseCurrency}
                  </ItemDescription>
                </div>
                <ItemDescription className="text-xs">
                  La moneda principal de Finanzas.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4.5 text-muted-foreground" />
              </ItemActions>
            </Item>
          </ItemGroup>
        </Card>
      </section>

      <EditTimeZoneSheet
        open={openTimeZoneSheet}
        onOpenChange={setOpenTimeZoneSheet}
      />
      <EditLocaleSheet
        key={profile?.locale ?? DEFAULT_LOCALE}
        open={openLocaleSheet}
        onOpenChange={setOpenLocaleSheet}
      />
      <EditWeekStartSheet
        key={storedWeekStart ?? "auto"}
        open={openWeekStartSheet}
        onOpenChange={setOpenWeekStartSheet}
      />
    </SettingsSecondaryPage>
  )
}
