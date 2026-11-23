"use client"

import { useInstitutions } from "@/src/modules/finance"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import { WipeBalanceInstitutionSheet } from "@/src/modules/settings/components/sheets/wipe-balance-institution-sheet"
import { WipeDataAuthAlerts } from "@/src/modules/settings/components/sheets/wipe-data-warnings"
import { WipeDataBranchPanel } from "@/src/modules/settings/components/sheets/wipe-data-branch-panel"
import { WipeUserDataConfirm } from "@/src/modules/settings/components/sheets/wipe-user-data-confirm"
import { useAuthConfirmMode } from "@/src/modules/settings/hooks/use-auth-confirm-mode"
import { useWipeBranchSelection } from "@/src/modules/settings/hooks/use-wipe-branch-selection"
import { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"

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
  const institutionsQuery = useInstitutions(true)
  const wipeMutation = useWipeUserData()
  const [balanceScope, setBalanceScope] = useState(ALL_INSTITUTIONS)
  const [countsChanged, setCountsChanged] = useState(false)
  const institutionPicker = usePicker<WipeInstitutionPicker>("none")

  const closeInstitutionPicker = () => {
    institutionPicker.closeHandlerFor(
      SETTINGS_SHEET_KEYS.wipeBalanceInstitution
    )(false)
  }

  const selection = useWipeBranchSelection({
    app,
    onBalancesDeselected: closeInstitutionPicker,
    onSelectionChanged: () => setCountsChanged(false),
  })
  const confirmMode = useAuthConfirmMode({ email, active: true })

  const balanceScopeLabel =
    balanceScope === ALL_INSTITUTIONS
      ? "Todas las instituciones"
      : (institutionsQuery.data?.find(
          (institution) => institution.id === balanceScope
        )?.name ?? "Todas las instituciones")

  const balanceInstitutionId =
    selection.balancesApplied && balanceScope !== ALL_INSTITUTIONS
      ? balanceScope
      : undefined

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

        <WipeDataBranchPanel
          branchesQuery={selection.branchesQuery}
          branches={selection.branches}
          sections={selection.sections}
          appliedIds={selection.appliedIds}
          allSelected={selection.allSelected}
          hasSelection={selection.hasSelection}
          disabled={wipeMutation.isPending}
          balanceScopeLabel={balanceScopeLabel}
          app={app}
          onToggleAll={selection.toggleAll}
          onToggleBranch={selection.toggleBranch}
          onPickInstitution={() =>
            institutionPicker.openPicker(
              SETTINGS_SHEET_KEYS.wipeBalanceInstitution
            )
          }
        />

        {selection.branches.length > 0 ? (
          <WipeDataAuthAlerts confirmMode={confirmMode} />
        ) : null}

        <WipeUserDataConfirm
          email={email}
          app={app}
          confirmMode={confirmMode}
          hasBranches={selection.branches.length > 0}
          appliedIds={selection.appliedIds}
          appliedBranches={selection.appliedBranches}
          appliedRows={selection.appliedRows}
          expectedCounts={selection.expectedCounts}
          balanceInstitutionId={balanceInstitutionId}
          balanceScopeLabel={balanceScopeLabel}
          wipeMutation={wipeMutation}
          onCountsChanged={setCountsChanged}
          onWiped={onWiped}
        />
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
    </>
  )
}
