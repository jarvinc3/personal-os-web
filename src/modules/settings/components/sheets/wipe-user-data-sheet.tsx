"use client"

import { useAuth } from "@/src/modules/auth"
import { useInstitutions } from "@/src/modules/finance"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import {
  reauthenticateWithPassword,
  useWipeUserData,
} from "@/src/modules/settings/hooks/use-wipe-user-data"
import {
  fetchCurrentAuthIdentities,
  hasEmailPasswordProvider,
  isGoogleOnlyAccount,
} from "@/src/modules/settings/lib/auth-providers"
import { setPendingDataWipe } from "@/src/modules/settings/lib/pending-data-wipe"
import { resolveReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import {
  applyWipeLayerToggle,
  toggleWipeGroupLayers,
  wipeGroupChecked,
  expandWipeLayerSelection,
  sortWipeLayers,
  WIPE_LAYER_DESCRIPTIONS,
  WIPE_LAYER_GROUPS,
  WIPE_LAYER_LABELS,
  WIPE_LAYERS,
  type WipeLayerId,
} from "@/src/modules/settings/lib/wipe-layers"
import { AuthServiceError } from "@/src/modules/auth"
import { WipeBalanceInstitutionSheet } from "@/src/modules/settings/components/sheets/wipe-balance-institution-sheet"
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
import { Checkbox } from "@/src/shared/components/ui/checkbox"
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
  Scale,
  Settings,
  Tags,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const ALL_WIPE_LAYERS = sortWipeLayers(
  WIPE_LAYER_GROUPS.flatMap((group) => group.layers)
)

const ALL_INSTITUTIONS = "all"

const WIPE_ACCENT = SETTINGS_REGISTRY.danger.accent

const WIPE_GROUP_ICONS: Record<string, LucideIcon> = {
  Finanzas: Landmark,
  "Asistente IA": Bot,
  Notificaciones: Bell,
  Configuración: Settings,
}

const WIPE_LAYER_ICONS: Record<WipeLayerId, LucideIcon> = {
  [WIPE_LAYERS.FINANCE_LEDGER]: Receipt,
  [WIPE_LAYERS.FINANCE_BALANCES]: Scale,
  [WIPE_LAYERS.FINANCE_PLANNING]: PiggyBank,
  [WIPE_LAYERS.FINANCE_CATEGORIES]: Tags,
  [WIPE_LAYERS.FINANCE_CATALOG]: Landmark,
  [WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS]: Mail,
  [WIPE_LAYERS.AI_SESSIONS]: Bot,
  [WIPE_LAYERS.NOTIFICATIONS]: Bell,
  [WIPE_LAYERS.SETTINGS_DEFAULTS]: RotateCcw,
}

type WipeUserDataViewProps = {
  email: string
  /** Every layer is wiped; the per-module picker stays hidden. */
  fixedLayers?: readonly WipeLayerId[]
  /** Title of the last confirmation when the layers are fixed. */
  confirmTitle?: string
  onWiped?: () => void
}

export function WipeUserDataView({
  email,
  fixedLayers,
  confirmTitle,
  onWiped,
}: WipeUserDataViewProps) {
  const router = useRouter()
  const wipeMutation = useWipeUserData()
  const { loginWithGoogleMutation } = useAuth()
  const institutionsQuery = useInstitutions(true)

  const [selected, setSelected] = useState<WipeLayerId[]>(() =>
    fixedLayers ? [...fixedLayers] : []
  )
  const [balanceScope, setBalanceScope] = useState(ALL_INSTITUTIONS)
  const [institutionSheetOpen, setInstitutionSheetOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string>()
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [canWipeInApp, setCanWipeInApp] = useState<boolean | null>(null)
  const [isGoogleOnly, setIsGoogleOnly] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const passwordRef = useRef("")
  const passwordVerified =
    verifiedPassword !== null && verifiedPassword === password.trim()

  const appliedLayers = useMemo(
    () => expandWipeLayerSelection(selected),
    [selected]
  )
  const allSelected = selected.length === ALL_WIPE_LAYERS.length
  const ledgerSelected = selected.includes(WIPE_LAYERS.FINANCE_LEDGER)
  const balancesSelected = selected.includes(WIPE_LAYERS.FINANCE_BALANCES)
  const catalogSelected = selected.includes(WIPE_LAYERS.FINANCE_CATALOG)
  const categoriesSelected = selected.includes(WIPE_LAYERS.FINANCE_CATEGORIES)

  const balanceScopeLabel =
    balanceScope === ALL_INSTITUTIONS
      ? "Todas las instituciones"
      : (institutionsQuery.data?.find(
          (institution) => institution.id === balanceScope
        )?.name ?? "Todas las instituciones")
  if (!balancesSelected && institutionSheetOpen) {
    setInstitutionSheetOpen(false)
  }

  const balanceInstitutionId =
    balancesSelected && balanceScope !== ALL_INSTITUTIONS
      ? balanceScope
      : undefined

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
    // Auth identities decide whether this account confirms with a password.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAuthProviders()
  }, [loadAuthProviders])

  const handleToggleLayer = (layer: WipeLayerId, checked: boolean) => {
    setSelected((current) => applyWipeLayerToggle(current, layer, checked))
  }

  const handleToggleAll = (checked: boolean) => {
    setSelected(checked ? ALL_WIPE_LAYERS : [])
  }

  const handleToggleGroup = (
    layers: readonly WipeLayerId[],
    checked: boolean
  ) => {
    setSelected((current) => toggleWipeGroupLayers(current, layers, checked))
  }

  const clearPassword = () => {
    setPassword("")
    passwordRef.current = ""
    setPasswordError(undefined)
    setVerifiedPassword(null)
  }

  const handleContinue = () => {
    if (selected.length === 0) {
      return
    }
    clearPassword()
    setAlertOpen(true)
  }

  const handleConfirmWipe = () => {
    if (!passwordVerified) {
      return
    }
    wipeMutation.mutate(
      {
        email,
        password,
        layers: appliedLayers,
        balanceInstitutionId,
        skipReauth: true,
      },
      {
        onSuccess: () => {
          setAlertOpen(false)
          if (onWiped) {
            onWiped()
            return
          }
          router.push(APP_ROUTES.app.settings)
        },
      }
    )
  }

  const handlePasswordChange = (value: string) => {
    passwordRef.current = value
    setPassword(value)
    setVerifiedPassword(null)
    setPasswordError(undefined)
  }

  const handlePasswordBlur = async () => {
    const current = passwordRef.current.trim()
    if (!current) {
      setVerifiedPassword(null)
      return
    }
    setIsVerifyingPassword(true)
    try {
      await reauthenticateWithPassword(email, current)
      if (passwordRef.current.trim() !== current) {
        return
      }
      setVerifiedPassword(current)
      setPasswordError(undefined)
    } catch (error) {
      if (passwordRef.current.trim() !== current) {
        return
      }
      setVerifiedPassword(null)
      setPasswordError(
        error instanceof AuthServiceError
          ? error.message
          : "La contraseña no es correcta."
      )
    } finally {
      setIsVerifyingPassword(false)
    }
  }

  const handleGoogleReauth = () => {
    setPendingDataWipe({
      layers: appliedLayers,
      balanceInstitutionId,
    })
    loginWithGoogleMutation.mutate({ next: APP_ROUTES.app.settings })
  }

  const confirmMode = resolveReauthConfirmMode({
    isLoadingProviders,
    canConfirmInApp: canWipeInApp,
    isGoogleOnly,
  })

  const confirmAction =
    confirmMode === "pending" ? (
      <Button variant="destructive" className="w-full" disabled>
        <Spinner data-icon="inline-start" />
        Continuar
      </Button>
    ) : confirmMode === "google" ? (
      <Button
        variant="destructive"
        className="w-full"
        disabled={selected.length === 0 || loginWithGoogleMutation.isPending}
        onClick={handleGoogleReauth}
      >
        {loginWithGoogleMutation.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Trash2 data-icon="inline-start" />
        )}
        {loginWithGoogleMutation.isPending
          ? "Confirmando con Google..."
          : "Confirmar con Google"}
      </Button>
    ) : confirmMode === "password" ? (
      <Button
        variant="destructive"
        className="w-full"
        disabled={selected.length === 0 || wipeMutation.isPending}
        onClick={handleContinue}
      >
        {wipeMutation.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Trash2 data-icon="inline-start" />
        )}
        Continuar
      </Button>
    ) : null

  return (
    <>
      <div className="flex flex-col gap-4">
        {fixedLayers ? (
          <SummarySection title="Se borrará" icon={Layers}>
            <ul className="flex flex-col gap-2">
              {fixedLayers.map((layer) => (
                <li
                  key={layer}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  • {WIPE_LAYER_LABELS[layer]}
                </li>
              ))}
            </ul>
          </SummarySection>
        ) : (
          <>
            <SummarySection title="Capas" icon={Layers}>
              <SettingsRow
                label="Seleccionar todo (excepto cuenta)"
                description="Marca todas las capas disponibles."
                icon={ListChecks}
                accentColor={WIPE_ACCENT}
                trailing={
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(value) => handleToggleAll(value === true)}
                    disabled={wipeMutation.isPending}
                    aria-label="Seleccionar todo (excepto cuenta)"
                  />
                }
                disabled={wipeMutation.isPending}
                isLast
              />
            </SummarySection>

            {WIPE_LAYER_GROUPS.map((group) => (
              <SummarySection
                key={group.title}
                title={group.title}
                icon={WIPE_GROUP_ICONS[group.title]}
                right={
                  group.layers.length > 1 ? (
                    <Checkbox
                      checked={
                        wipeGroupChecked(group.layers, selected) === true
                      }
                      indeterminate={
                        wipeGroupChecked(group.layers, selected) ===
                        "indeterminate"
                      }
                      onCheckedChange={(value) =>
                        handleToggleGroup(group.layers, value === true)
                      }
                      disabled={wipeMutation.isPending}
                      aria-label={`Seleccionar ${group.title}`}
                    />
                  ) : null
                }
              >
                {group.layers.map((layer, index) => {
                  const requiredByCatalog =
                    layer === WIPE_LAYERS.FINANCE_LEDGER && catalogSelected
                  const requiredByCategories =
                    layer === WIPE_LAYERS.FINANCE_PLANNING && categoriesSelected
                  const disabled =
                    requiredByCatalog ||
                    requiredByCategories ||
                    wipeMutation.isPending
                  return (
                    <div key={layer}>
                      <SettingsRow
                        label={WIPE_LAYER_LABELS[layer]}
                        description={WIPE_LAYER_DESCRIPTIONS[layer]}
                        icon={WIPE_LAYER_ICONS[layer]}
                        accentColor={WIPE_ACCENT}
                        trailing={
                          <Checkbox
                            checked={selected.includes(layer)}
                            onCheckedChange={(value) =>
                              handleToggleLayer(layer, value === true)
                            }
                            disabled={disabled}
                            aria-label={WIPE_LAYER_LABELS[layer]}
                          />
                        }
                        disabled={disabled}
                        isLast={
                          index === group.layers.length - 1 &&
                          !(
                            layer === WIPE_LAYERS.FINANCE_BALANCES &&
                            balancesSelected
                          )
                        }
                      />
                      {layer === WIPE_LAYERS.FINANCE_BALANCES &&
                      balancesSelected ? (
                        <SettingsRow
                          label="Institución"
                          value={balanceScopeLabel}
                          icon={Landmark}
                          accentColor={WIPE_ACCENT}
                          onPress={() => setInstitutionSheetOpen(true)}
                          disabled={wipeMutation.isPending}
                          isLast
                        />
                      ) : null}
                    </div>
                  )
                })}
              </SummarySection>
            ))}
          </>
        )}

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

        <Alert variant="destructive">
          <KeyRound />
          <AlertTitle>Esto no se puede deshacer</AlertTitle>
          <AlertDescription>
            No hay papelera ni copia de seguridad. Los datos vaciados no
            vuelven.
          </AlertDescription>
        </Alert>

        {confirmAction}
      </div>

      <WipeBalanceInstitutionSheet
        open={institutionSheetOpen}
        onOpenChange={setInstitutionSheetOpen}
        value={balanceScope}
        allValue={ALL_INSTITUTIONS}
        onSelect={setBalanceScope}
      />

      <AlertDialog
        open={alertOpen}
        onOpenChange={(next) => {
          setAlertOpen(next)
          if (!next && !wipeMutation.isPending) {
            clearPassword()
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {fixedLayers
                ? (confirmTitle ?? "¿Vaciar todos los datos?")
                : "¿Vaciar los datos seleccionados?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esto no se puede deshacer. Se vaciarán:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="flex flex-col gap-2">
            {appliedLayers.map((layer) => (
              <li key={layer} className="text-sm text-muted-foreground">
                • {WIPE_LAYER_LABELS[layer]}
                {layer === WIPE_LAYERS.FINANCE_BALANCES
                  ? ` (${balanceScopeLabel})`
                  : null}
              </li>
            ))}
          </ul>
          <SummarySection title="Confirma tu contraseña" icon={KeyRound}>
            <FormTextField
              icon={KeyRound}
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => void handlePasswordBlur()}
              disabled={wipeMutation.isPending || isVerifyingPassword}
              error={passwordError}
              invalid={Boolean(passwordError)}
            />
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Cuenta</p>
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            </div>
          </SummarySection>
          <AlertDialogFooter className="flex-row">
            <AlertDialogCancel
              className="flex-1"
              disabled={wipeMutation.isPending}
            >
              <X data-icon="inline-start" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="flex-1"
              disabled={
                !passwordVerified ||
                isVerifyingPassword ||
                wipeMutation.isPending
              }
              onClick={handleConfirmWipe}
            >
              {wipeMutation.isPending || isVerifyingPassword ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {wipeMutation.isPending ? "Vaciando..." : "Vaciar datos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
