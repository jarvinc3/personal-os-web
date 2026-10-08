"use client"

import { useAuth } from "@/src/modules/auth"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
import {
  fetchCurrentAuthIdentities,
  hasEmailPasswordProvider,
  isGoogleOnlyAccount,
} from "@/src/modules/settings/lib/auth-providers"
import { setPendingDataWipe } from "@/src/modules/settings/lib/pending-data-wipe"
import { resolveReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import {
  applyWipeLayerToggle,
  expandWipeLayerSelection,
  sortWipeLayers,
  WIPE_LAYER_DESCRIPTIONS,
  WIPE_LAYER_GROUPS,
  WIPE_LAYER_LABELS,
  WIPE_LAYERS,
  type WipeLayerId,
} from "@/src/modules/settings/lib/wipe-layers"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { SettingsRow } from "@/src/shared/components/layout/settings-section"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  AlertTriangle,
  Bell,
  Bot,
  KeyRound,
  Landmark,
  Layers,
  ListChecks,
  Mail,
  PiggyBank,
  Receipt,
  RotateCcw,
  Settings,
  Tags,
  type LucideIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

const ALL_WIPE_LAYERS = sortWipeLayers(
  WIPE_LAYER_GROUPS.flatMap((group) => group.layers)
)

const WIPE_ACCENT = SETTINGS_REGISTRY.danger.accent

const WIPE_GROUP_ICONS: Record<string, LucideIcon> = {
  Finanzas: Landmark,
  "Asistente IA": Bot,
  Notificaciones: Bell,
  Configuración: Settings,
}

const WIPE_LAYER_ICONS: Record<WipeLayerId, LucideIcon> = {
  [WIPE_LAYERS.FINANCE_LEDGER]: Receipt,
  [WIPE_LAYERS.FINANCE_PLANNING]: PiggyBank,
  [WIPE_LAYERS.FINANCE_CATEGORIES]: Tags,
  [WIPE_LAYERS.FINANCE_CATALOG]: Landmark,
  [WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS]: Mail,
  [WIPE_LAYERS.AI_SESSIONS]: Bot,
  [WIPE_LAYERS.NOTIFICATIONS]: Bell,
  [WIPE_LAYERS.SETTINGS_DEFAULTS]: RotateCcw,
}

type WipeUserDataSheetProps = SettingsSheetProps & {
  email: string
}

export function WipeUserDataSheet({
  open,
  onOpenChange,
  email,
}: WipeUserDataSheetProps) {
  const wipeMutation = useWipeUserData()
  const { loginWithGoogleMutation } = useAuth()

  const [selected, setSelected] = useState<WipeLayerId[]>([])
  const [password, setPassword] = useState("")
  const [alertOpen, setAlertOpen] = useState(false)
  const [canWipeInApp, setCanWipeInApp] = useState<boolean | null>(null)
  const [isGoogleOnly, setIsGoogleOnly] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)

  const appliedLayers = useMemo(
    () => expandWipeLayerSelection(selected),
    [selected]
  )
  const allSelected = selected.length === ALL_WIPE_LAYERS.length
  const ledgerSelected = selected.includes(WIPE_LAYERS.FINANCE_LEDGER)
  const catalogSelected = selected.includes(WIPE_LAYERS.FINANCE_CATALOG)
  const categoriesSelected = selected.includes(WIPE_LAYERS.FINANCE_CATEGORIES)

  const loadAuthProviders = useCallback(async () => {
    setIsLoadingProviders(true)
    try {
      const { identities } = await fetchCurrentAuthIdentities()
      if (!identities?.length) {
        setCanWipeInApp(Boolean(email))
        setIsGoogleOnly(false)
        return
      }
      setCanWipeInApp(hasEmailPasswordProvider(identities))
      setIsGoogleOnly(isGoogleOnlyAccount(identities))
    } catch {
      setCanWipeInApp(Boolean(email))
      setIsGoogleOnly(false)
    } finally {
      setIsLoadingProviders(false)
    }
  }, [email])

  useEffect(() => {
    if (!open) return
    setSelected([])
    setPassword("")
    setAlertOpen(false)
    void loadAuthProviders()
  }, [open, loadAuthProviders])

  const handleToggleLayer = (layer: WipeLayerId, checked: boolean) => {
    setSelected((current) => applyWipeLayerToggle(current, layer, checked))
  }

  const handleToggleAll = (checked: boolean) => {
    setSelected(checked ? ALL_WIPE_LAYERS : [])
  }

  const handleContinue = () => {
    if (selected.length === 0) {
      return
    }
    onOpenChange(false)
    setAlertOpen(true)
  }

  const resetAfterWipe = () => {
    setAlertOpen(false)
    setSelected([])
    setPassword("")
  }

  const handleConfirmWipe = () => {
    wipeMutation.mutate(
      { email, password, layers: appliedLayers },
      { onSettled: resetAfterWipe }
    )
  }

  const handleGoogleReauth = () => {
    setPendingDataWipe(appliedLayers)
    onOpenChange(false)
    loginWithGoogleMutation.mutate({ next: APP_ROUTES.app.settings })
  }

  const confirmMode = resolveReauthConfirmMode({
    isLoadingProviders,
    canConfirmInApp: canWipeInApp,
    isGoogleOnly,
  })

  const confirmAction =
    confirmMode === "pending" ? (
      <Button variant="destructive" className="flex-1" disabled>
        <Spinner data-icon="inline-start" />
        Continuar
      </Button>
    ) : confirmMode === "google" ? (
      <Button
        variant="destructive"
        className="flex-1"
        disabled={selected.length === 0 || loginWithGoogleMutation.isPending}
        onClick={handleGoogleReauth}
      >
        {loginWithGoogleMutation.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : null}
        {loginWithGoogleMutation.isPending
          ? "Confirmando con Google..."
          : "Confirmar con Google"}
      </Button>
    ) : confirmMode === "password" ? (
      <Button
        variant="destructive"
        className="flex-1"
        disabled={selected.length === 0 || wipeMutation.isPending}
        onClick={handleContinue}
      >
        {wipeMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
        Continuar
      </Button>
    ) : null

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Vaciar datos"
        description="Elige las capas a vaciar. Tu cuenta y tu acceso siguen."
        actions={{ submit: confirmAction }}
      >
        <SummarySection title="Capas" icon={Layers}>
          <SettingsRow
            label="Seleccionar todo (excepto cuenta)"
            description="Marca todas las capas disponibles."
            icon={ListChecks}
            accentColor={WIPE_ACCENT}
            switchValue={allSelected}
            onSwitchChange={handleToggleAll}
            disabled={wipeMutation.isPending}
            isLast
          />
        </SummarySection>

        {WIPE_LAYER_GROUPS.map((group) => (
          <SummarySection
            key={group.title}
            title={group.title}
            icon={WIPE_GROUP_ICONS[group.title]}
          >
            {group.layers.map((layer, index) => {
              const requiredByCatalog =
                layer === WIPE_LAYERS.FINANCE_LEDGER && catalogSelected
              const requiredByCategories =
                layer === WIPE_LAYERS.FINANCE_PLANNING && categoriesSelected
              return (
                <SettingsRow
                  key={layer}
                  label={WIPE_LAYER_LABELS[layer]}
                  description={WIPE_LAYER_DESCRIPTIONS[layer]}
                  icon={WIPE_LAYER_ICONS[layer]}
                  accentColor={WIPE_ACCENT}
                  switchValue={selected.includes(layer)}
                  onSwitchChange={(checked) =>
                    handleToggleLayer(layer, checked)
                  }
                  disabled={
                    requiredByCatalog ||
                    requiredByCategories ||
                    wipeMutation.isPending
                  }
                  isLast={index === group.layers.length - 1}
                />
              )
            })}
          </SummarySection>
        ))}

        {ledgerSelected ? (
          <Alert>
            <AlertTriangle />
            <AlertTitle>Gmail</AlertTitle>
            <AlertDescription>
              El próximo sync puede volver a importar movimientos. El sync
              automático se pausará.
            </AlertDescription>
          </Alert>
        ) : null}

        {confirmMode === "google" ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Cuenta vinculada con Google</AlertTitle>
            <AlertDescription>
              Confirma tu identidad con Google para vaciar los datos. Serás
              redirigido a Google y, al volver, podrás confirmar el vaciado.
            </AlertDescription>
          </Alert>
        ) : null}

        {confirmMode === "unavailable" ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>No se puede confirmar</AlertTitle>
            <AlertDescription>
              Esta sesión no tiene contraseña ni un acceso solo con Google, así
              que el vaciado no se puede confirmar desde aquí.
            </AlertDescription>
          </Alert>
        ) : null}

        {confirmMode === "password" ? (
          <SummarySection title="Confirma tu contraseña" icon={KeyRound}>
            <FormTextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña actual"
              value={password}
              onChange={setPassword}
              disabled={wipeMutation.isPending}
            />
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Cuenta</p>
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            </div>
          </SummarySection>
        ) : null}

        <Alert variant="destructive">
          <KeyRound />
          <AlertTitle>Esto no se puede deshacer</AlertTitle>
          <AlertDescription>
            No hay papelera ni copia de seguridad. Los datos vaciados no
            vuelven.
          </AlertDescription>
        </Alert>
      </BottomSheet>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Vaciar los datos seleccionados?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esto no se puede deshacer. Se vaciarán:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="flex flex-col gap-2">
            {appliedLayers.map((layer) => (
              <li key={layer} className="text-sm text-muted-foreground">
                • {WIPE_LAYER_LABELS[layer]}
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={wipeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={wipeMutation.isPending}
              onClick={handleConfirmWipe}
            >
              {wipeMutation.isPending ? "Vaciando..." : "Vaciar datos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
