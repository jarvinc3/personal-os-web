"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useAiConsent } from "@/src/modules/intelligence"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { DeleteAccountSheet } from "@/src/modules/settings/components/sheets/delete-account-sheet"
import { WipeDataSheet } from "@/src/modules/settings/components/sheets/wipe-data-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import { usePreferenceToggle } from "@/src/modules/settings/hooks/use-preference-toggle"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { Switch } from "@/src/shared/components/ui/switch"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { cn } from "@/src/shared/lib/utils"
import { BrainCircuit, ChevronRightIcon } from "lucide-react"

const AI_CONSENT_ACCENT = "#8b5cf6"

const PRIVACY = SETTINGS_REGISTRY.privacy
const DANGER = SETTINGS_REGISTRY.danger
const AnalyticsIcon = PRIVACY.rows.analytics.icon
const CrashReportsIcon = PRIVACY.rows.crashReports.icon
const WipeDataIcon = DANGER.rows.wipeData.icon
const DeleteAccountIcon = DANGER.rows.deleteAccount.icon

export function PrivacySettingsScreen() {
  return (
    <SettingsGate>
      <PrivacySettingsScreenBody />
    </SettingsGate>
  )
}

function PrivacySettingsScreenBody() {
  const { user } = useAuthGuard()
  const { preferences, profileQuery } = useProfile()
  const togglePreference = usePreferenceToggle()
  const { open: openDeleteAccountSheet, setOpen: setOpenDeleteAccountSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.deleteAccount)
  const { open: openWipeAllSheet, setOpen: setOpenWipeAllSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.wipeData)
  const displayEmail = profileQuery.data?.email ?? user?.email ?? ""
  const { consentQuery, consentMutation } = useAiConsent()
  const consentDisabled =
    consentQuery.isPending || consentMutation.isPending || consentQuery.isError

  const preferenceRows = [
    {
      key: "analytics",
      label: "Analíticas",
      description: "Ayuda a mejorar la app con datos de uso.",
      icon: AnalyticsIcon,
      checked: preferences.privacy.analyticsEnabled,
      onCheckedChange: (checked: boolean) => {
        togglePreference(
          { privacy: { analyticsEnabled: checked } },
          "Preferencia de analíticas actualizada."
        )
      },
    },
    {
      key: "crashReports",
      label: "Reportes de fallos",
      description: "Envía información cuando algo falla.",
      icon: CrashReportsIcon,
      checked: preferences.privacy.crashReportsEnabled,
      onCheckedChange: (checked: boolean) => {
        togglePreference(
          { privacy: { crashReportsEnabled: checked } },
          "Preferencia de reportes actualizada."
        )
      },
    },
  ]

  const dataRows = [
    {
      key: "wipeData",
      label: "Vaciar todos los datos",
      description: "Elige qué ramas de datos vaciar de todas las apps.",
      icon: WipeDataIcon,
      onPress: () => setOpenWipeAllSheet(true),
    },
    {
      key: "deleteAccount",
      label: "Eliminar la cuenta",
      description: "Borra la cuenta y todos sus datos. No se puede deshacer.",
      icon: DeleteAccountIcon,
      onPress: () => setOpenDeleteAccountSheet(true),
    },
  ]

  return (
    <SettingsSecondaryPage title="Privacidad y datos">
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Privacidad
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {preferenceRows.map(
              ({
                key,
                label,
                description,
                icon: Icon,
                checked,
                onCheckedChange,
              }) => (
                <Item
                  key={key}
                  variant="plain"
                  className="min-h-[52px] px-3 py-3"
                >
                  <ItemMedia
                    className="size-9 rounded-md"
                    style={{ backgroundColor: `${PRIVACY.accent}20` }}
                  >
                    <Icon
                      className="size-4.5"
                      style={{ color: PRIVACY.accent }}
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
                    <Switch
                      checked={checked}
                      onCheckedChange={onCheckedChange}
                    />
                  </ItemActions>
                </Item>
              )
            )}
            <Item
              variant="plain"
              className={cn(
                "min-h-[52px] px-3 py-3",
                consentDisabled && "opacity-50"
              )}
              aria-disabled={consentDisabled || undefined}
            >
              <ItemMedia
                className="size-9 rounded-md"
                style={{ backgroundColor: `${AI_CONSENT_ACCENT}20` }}
              >
                <BrainCircuit
                  className="size-4.5"
                  style={{ color: AI_CONSENT_ACCENT }}
                />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <ItemTitle className="text-sm font-normal md:text-base">
                  Contribuir al conocimiento global de IA
                </ItemTitle>
                <ItemDescription className="text-xs">
                  Permite usar mensajes saneados para mejorar el conocimiento
                  compartido. Puedes revocarlo cuando quieras.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch
                  checked={
                    consentQuery.data?.contributeToGlobalKnowledge ?? true
                  }
                  onCheckedChange={(checked) => consentMutation.mutate(checked)}
                  disabled={consentDisabled}
                />
              </ItemActions>
            </Item>
          </ItemGroup>
          {consentQuery.isError ? (
            <ErrorState
              message="No se pudo cargar el consentimiento de analítica."
              onRetry={() => void consentQuery.refetch()}
              isRetrying={consentQuery.isFetching}
            />
          ) : null}
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-0.5 px-1">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Tus datos
          </h2>
          <p className="text-xs text-muted-foreground">
            Estas acciones afectan a toda la cuenta.
          </p>
        </div>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {dataRows.map(
              ({ key, label, description, icon: Icon, onPress }) => (
                <Item
                  key={key}
                  variant="plain"
                  className="min-h-[52px] px-3 py-3"
                  render={<button type="button" onClick={onPress} />}
                >
                  <ItemMedia
                    className="size-9 rounded-md"
                    style={{ backgroundColor: `${DANGER.accent}20` }}
                  >
                    <Icon className="size-4.5 text-destructive" />
                  </ItemMedia>
                  <ItemContent className="gap-0.5">
                    <ItemTitle className="text-sm font-normal text-destructive md:text-base">
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

      <WipeDataSheet
        open={openWipeAllSheet}
        onOpenChange={setOpenWipeAllSheet}
        email={displayEmail}
        title="Vaciar todos los datos"
        description="Borra las ramas de datos que elijas. La cuenta se conserva."
      />
      <DeleteAccountSheet
        open={openDeleteAccountSheet}
        onOpenChange={setOpenDeleteAccountSheet}
        email={displayEmail}
      />
    </SettingsSecondaryPage>
  )
}
