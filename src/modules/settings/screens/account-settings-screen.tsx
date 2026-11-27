"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditAccountSheet } from "@/src/modules/settings/components/sheets/edit-account-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar"
import { Button } from "@/src/shared/components/ui/button"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ChevronRightIcon, Edit, LogOut, Mail } from "lucide-react"

export function AccountSettingsScreen() {
  return (
    <SettingsGate>
      <AccountSettingsScreenBody />
    </SettingsGate>
  )
}

function AccountSettingsScreenBody() {
  const { user } = useAuthGuard()
  const { logoutMutation } = useAuth()
  const { profileQuery } = useProfile()
  const profile = profileQuery.data
  const ProfileIcon = SETTINGS_REGISTRY.account.rows.fullName.icon
  const displayName = profile?.fullName ?? user?.fullName ?? "Usuario"
  const displayEmail = profile?.email ?? user?.email ?? ""
  const { open: openAccountSheet, setOpen: setOpenAccountSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.account)

  return (
    <SettingsSecondaryPage title="Perfil y cuenta">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative">
          <Avatar className="size-24">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-base font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            type="button"
            variant="secondary"
            className="absolute top-0 right-0 bg-muted"
            aria-label="Editar perfil"
            onClick={() => setOpenAccountSheet(true)}
          >
            <Edit className="size-3.5 text-foreground" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayEmail}</p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Cuenta
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            <Item
              variant="plain"
              className="min-h-[52px] px-3 py-3"
              render={
                <button
                  type="button"
                  onClick={() => setOpenAccountSheet(true)}
                />
              }
            >
              <ItemMedia
                className="size-9 rounded-md"
                style={{
                  backgroundColor: `${SETTINGS_REGISTRY.account.accent}20`,
                }}
              >
                <ProfileIcon
                  className="size-4.5"
                  style={{ color: SETTINGS_REGISTRY.account.accent }}
                />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                  <ItemTitle className="text-sm font-normal md:text-base">
                    Perfil
                  </ItemTitle>
                  <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                    {displayName}
                  </ItemDescription>
                </div>
                <ItemDescription className="text-xs">
                  Nombre y foto de la cuenta.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4.5 text-muted-foreground" />
              </ItemActions>
            </Item>
            <Item variant="plain" className="min-h-[52px] px-3 py-3">
              <ItemMedia
                className="size-9 rounded-md"
                style={{
                  backgroundColor: `${SETTINGS_REGISTRY.account.accent}20`,
                }}
              >
                <Mail
                  className="size-4.5"
                  style={{ color: SETTINGS_REGISTRY.account.accent }}
                />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                  <ItemTitle className="text-sm font-normal md:text-base">
                    Correo
                  </ItemTitle>
                  <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                    {displayEmail}
                  </ItemDescription>
                </div>
                <ItemDescription className="text-xs">
                  El correo de acceso no se cambia desde aquí.
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Sesión
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0">
            <Item
              variant="plain"
              className="min-h-[52px] px-3 py-3"
              render={
                <button type="button" onClick={() => logoutMutation.mutate()} />
              }
            >
              <ItemContent className="gap-0.5">
                <ItemTitle className="text-sm font-normal text-destructive md:text-base">
                  Cerrar sesión
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <LogOut className="size-4 text-destructive" />
              </ItemActions>
            </Item>
          </ItemGroup>
        </Card>
      </section>

      <EditAccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        email={displayEmail}
      />
    </SettingsSecondaryPage>
  )
}
