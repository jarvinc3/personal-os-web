"use client"

import { ApiError } from "@/src/config/api-client"
import { AuthServiceError, useAuth } from "@/src/modules/auth"
import { useInstitutions } from "@/src/modules/finance"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import { WipeBranchList } from "@/src/modules/settings/components/wipe-branch-list"
import { WipeBalanceInstitutionSheet } from "@/src/modules/settings/components/sheets/wipe-balance-institution-sheet"
import { useDataBranches } from "@/src/modules/settings/hooks/use-data-branches"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
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
import {
  allSelectableBranchesSelected,
  branchesOf,
  buildWipeSections,
  expandWipeSelection,
  resolveWipeSelection,
  toggleAllBranchSelection,
  toggleBranchSelection,
} from "@/src/modules/settings/lib/wipe-branches"
import {
  wipeAppCopy,
  wipeBranchCopy,
} from "@/src/modules/settings/lib/wipe-branch-texts"
import { resolveReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import { FINANCE_BALANCES_BRANCH } from "@/src/modules/settings/types/wipe.types"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { AlertTriangle, Eraser, KeyRound, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const ALL_INSTITUTIONS = "all"

type WipeInstitutionPicker =
  "none" | typeof SETTINGS_SHEET_KEYS.wipeBalanceInstitution

type WipeUserDataViewProps = {
  email: string
  /** Restricts the list to one app; the global privacy view omits it. */
  app?: string
  onWiped?: () => void
}

export function WipeUserDataView({
  email,
  app,
  onWiped,
}: WipeUserDataViewProps) {
  const wipeMutation = useWipeUserData()
  const { loginWithGoogleMutation } = useAuth()
  const institutionsQuery = useInstitutions(true)
  const formatLocale = useFormatLocale()
  const branchesQuery = useDataBranches()

  const [selected, setSelected] = useState<string[]>([])
  const [balanceScope, setBalanceScope] = useState(ALL_INSTITUTIONS)
  const institutionPicker = usePicker<WipeInstitutionPicker>("none")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string>()
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [countsChanged, setCountsChanged] = useState(false)
  const [canWipeInApp, setCanWipeInApp] = useState<boolean | null>(null)
  const [isGoogleOnly, setIsGoogleOnly] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const passwordRef = useRef("")
  const passwordVerified =
    verifiedPassword !== null && verifiedPassword === password.trim()

  const groups = branchesQuery.data ?? []
  const branches = branchesOf(groups, app)
  const { selectedIds, appliedIds, appliedBranches, expectedCounts } =
    resolveWipeSelection({ branches, selected })
  const sections = buildWipeSections({
    groups,
    selected: selectedIds,
    locale: formatLocale,
    app,
  })
  const appliedRows = sections
    .flatMap((section) => section.rows)
    .filter((row) => appliedIds.includes(row.branch.id))
  const hasSelection = selectedIds.length > 0
  const allSelected = allSelectableBranchesSelected({
    branches,
    selected: selectedIds,
  })
  const balancesApplied = appliedIds.includes(FINANCE_BALANCES_BRANCH)

  const balanceScopeLabel =
    balanceScope === ALL_INSTITUTIONS
      ? "Todas las instituciones"
      : (institutionsQuery.data?.find(
          (institution) => institution.id === balanceScope
        )?.name ?? "Todas las instituciones")

  const balanceInstitutionId =
    balancesApplied && balanceScope !== ALL_INSTITUTIONS
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

  const closeInstitutionPicker = () => {
    institutionPicker.closeHandlerFor(
      SETTINGS_SHEET_KEYS.wipeBalanceInstitution
    )(false)
  }

  const keepInstitutionPickerInSync = (nextSelected: readonly string[]) => {
    const stillWipesBalances = expandWipeSelection({
      branches,
      selected: nextSelected,
    }).includes(FINANCE_BALANCES_BRANCH)
    if (!stillWipesBalances) {
      closeInstitutionPicker()
    }
  }

  const handleToggleBranch = (branchId: string, checked: boolean) => {
    const next = toggleBranchSelection({
      branches,
      selected: selectedIds,
      branchId,
      checked,
    })
    setSelected(next)
    setCountsChanged(false)
    keepInstitutionPickerInSync(next)
  }

  const handleToggleAll = (checked: boolean) => {
    const next = toggleAllBranchSelection({
      branches,
      selected: selectedIds,
      checked,
    })
    setSelected(next)
    setCountsChanged(false)
    keepInstitutionPickerInSync(next)
  }

  const clearPassword = () => {
    setPassword("")
    passwordRef.current = ""
    setPasswordError(undefined)
    setVerifiedPassword(null)
  }

  const handleContinue = () => {
    if (appliedIds.length === 0) {
      return
    }
    clearPassword()
    setCountsChanged(false)
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
        skipReauth: true,
        branches: appliedIds,
        expectedCounts,
        ...(balanceInstitutionId ? { balanceInstitutionId } : {}),
        branchLabels: Object.fromEntries(
          appliedBranches.map((branch) => [
            branch.id,
            wipeBranchCopy(branch).label,
          ])
        ),
      },
      {
        onSuccess: () => {
          setAlertOpen(false)
          onWiped?.()
        },
        onError: (error) => {
          if (!(error instanceof ApiError) || error.status !== 409) {
            return
          }
          setAlertOpen(false)
          clearPassword()
          setCountsChanged(true)
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
    if (appliedBranches.length === 0) {
      return
    }
    setPendingDataWipe({
      branches: appliedBranches.map((branch) => ({
        id: branch.id,
        label: wipeBranchCopy(branch).label,
        count: branch.count,
      })),
      ...(balanceInstitutionId ? { balanceInstitutionId } : {}),
    })
    loginWithGoogleMutation.mutate({ next: APP_ROUTES.app.settings })
  }

  const confirmMode = resolveReauthConfirmMode({
    isLoadingProviders,
    canConfirmInApp: canWipeInApp,
    isGoogleOnly,
  })

  const confirmTitle = app
    ? `¿Vaciar los datos de ${wipeAppCopy(app).label}?`
    : "¿Vaciar todos los datos?"

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
        disabled={appliedIds.length === 0 || loginWithGoogleMutation.isPending}
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
        disabled={appliedIds.length === 0 || wipeMutation.isPending}
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
        {countsChanged ? (
          <Alert>
            <AlertTriangle />
            <AlertTitle>Los conteos cambiaron</AlertTitle>
            <AlertDescription>
              La lista se actualizó con lo que hay ahora. Revisa cuánto se
              borrará y confirma otra vez.
            </AlertDescription>
          </Alert>
        ) : null}

        {branchesQuery.isPending ? (
          <div className="flex flex-col gap-2" aria-hidden>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : branchesQuery.isError ? (
          <ErrorState
            message="No se pudieron cargar las ramas de datos."
            onRetry={() => void branchesQuery.refetch()}
            isRetrying={branchesQuery.isFetching}
          />
        ) : branches.length === 0 ? (
          <Empty className="rounded-2xl border border-border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Eraser />
              </EmptyMedia>
              <EmptyTitle>Sin datos que vaciar</EmptyTitle>
              <EmptyDescription>
                {app
                  ? "Esta app no tiene ramas de datos."
                  : "No hay ramas de datos que vaciar."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <WipeBranchList
            sections={sections}
            appliedIds={appliedIds}
            allSelected={allSelected}
            hasSelection={hasSelection}
            disabled={wipeMutation.isPending}
            balanceScopeLabel={balanceScopeLabel}
            onToggleAll={handleToggleAll}
            onToggleBranch={handleToggleBranch}
            onPickInstitution={() =>
              institutionPicker.openPicker(
                SETTINGS_SHEET_KEYS.wipeBalanceInstitution
              )
            }
          />
        )}

        {branches.length > 0 && confirmMode === "google" ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Cuenta vinculada con Google</AlertTitle>
            <AlertDescription>
              Confirma tu identidad con Google para vaciar los datos. Serás
              redirigido a Google y, al volver, podrás confirmar el vaciado.
            </AlertDescription>
          </Alert>
        ) : null}

        {branches.length > 0 && confirmMode === "unavailable" ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>No se puede confirmar</AlertTitle>
            <AlertDescription>
              Esta sesión no tiene contraseña ni un acceso solo con Google, así
              que el vaciado no se puede confirmar desde aquí.
            </AlertDescription>
          </Alert>
        ) : null}

        {branches.length > 0 ? (
          <>
            <Alert variant="destructive">
              <KeyRound />
              <AlertTitle>Esto no se puede deshacer</AlertTitle>
              <AlertDescription>
                No hay papelera ni copia de seguridad. Los datos vaciados no
                vuelven.
              </AlertDescription>
            </Alert>
            {confirmAction}
          </>
        ) : null}
      </div>

      <WipeBalanceInstitutionSheet
        open={
          institutionPicker.picker ===
          SETTINGS_SHEET_KEYS.wipeBalanceInstitution
        }
        onOpenChange={institutionPicker.closeHandlerFor(
          SETTINGS_SHEET_KEYS.wipeBalanceInstitution
        )}
        value={balanceScope}
        allValue={ALL_INSTITUTIONS}
        onSelect={setBalanceScope}
      />

      <ConfirmDialog
        open={alertOpen}
        onOpenChange={(next) => {
          setAlertOpen(next)
          if (!next && !wipeMutation.isPending) {
            clearPassword()
          }
        }}
        tone="danger"
        icon={Trash2}
        wide
        title={confirmTitle}
        description="Esto no se puede deshacer. Se vaciarán:"
        confirmLabel="Vaciar datos"
        confirmIcon={Trash2}
        pending={wipeMutation.isPending}
        pendingLabel="Vaciando..."
        confirmDisabled={!passwordVerified || isVerifyingPassword}
        onConfirm={handleConfirmWipe}
      >
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
          {appliedRows.map((row) => (
            <li key={row.branch.id} className="text-sm text-muted-foreground">
              • {row.label} · {row.countLabel}
              {row.draggedByLabel
                ? ` (se vacía junto con ${row.draggedByLabel})`
                : ""}
              {row.branch.id === FINANCE_BALANCES_BRANCH
                ? ` · ${balanceScopeLabel}`
                : ""}
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
      </ConfirmDialog>
    </>
  )
}
