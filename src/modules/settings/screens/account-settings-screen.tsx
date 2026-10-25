"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditAccountSheet } from "@/src/modules/settings/components/sheets/edit-account-sheet"
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
import { Button } from "@/src/shared/components/ui/button"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { Edit, Mail } from "lucide-react"

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
  const displayName = profile?.fullName ?? user?.fullName ?? "Usuario"
  const displayEmail = profile?.email ?? user?.email ?? ""
  const { open: openAccountSheet, setOpen: setOpenAccountSheet } =
    useSheetParam("account-sheet")

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

      <SettingsSection title="Cuenta">
        <SettingsRow
          label="Perfil"
          description="Nombre y foto de la cuenta."
          value={displayName}
          onPress={() => setOpenAccountSheet(true)}
          accentColor={SETTINGS_REGISTRY.account.accent}
          {...SETTINGS_REGISTRY.account.rows.fullName}
        />
        <SettingsRow
          label="Correo"
          description="El correo de acceso no se cambia desde aquí."
          value={displayEmail}
          isLast
          accentColor={SETTINGS_REGISTRY.account.accent}
          icon={Mail}
        />
      </SettingsSection>

      <SettingsSection title="Sesión">
        <SettingsRow
          label="Cerrar sesión"
          destructive
          onPress={() => logoutMutation.mutate()}
          showChevron={false}
          isLast
        />
      </SettingsSection>

      <EditAccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        email={displayEmail}
      />
    </SettingsSecondaryPage>
  )
}
