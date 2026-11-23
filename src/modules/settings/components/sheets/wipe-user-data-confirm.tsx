"use client"

import { ApiError } from "@/src/config/api-client"
import { useAuth } from "@/src/modules/auth"
import { useReauthPassword } from "@/src/modules/settings/hooks/use-reauth-password"
import type { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
import { WipeDataConfirmAction } from "@/src/modules/settings/components/sheets/wipe-data-confirm-action"
import { WipeDataConfirmDialog } from "@/src/modules/settings/components/sheets/wipe-data-confirm-dialog"
import { WipeDataIrreversibleAlert } from "@/src/modules/settings/components/sheets/wipe-data-warnings"
import {
  wipeAppCopy,
  wipeBranchCopy,
} from "@/src/modules/settings/lib/wipe-branch-texts"
import type { WipeRow } from "@/src/modules/settings/lib/wipe-branches"
import type { ReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import { setPendingDataWipe } from "@/src/modules/settings/lib/pending-data-wipe"
import type { DataBranch } from "@/src/modules/settings/types/wipe.types"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useState } from "react"

type WipeUserDataConfirmProps = {
  email: string
  app?: string
  confirmMode: ReauthConfirmMode
  hasBranches: boolean
  appliedIds: string[]
  appliedBranches: DataBranch[]
  appliedRows: WipeRow[]
  expectedCounts: Record<string, number>
  balanceInstitutionId?: string
  balanceScopeLabel: string
  wipeMutation: ReturnType<typeof useWipeUserData>
  onCountsChanged: (changed: boolean) => void
  onWiped?: () => void
}

export function WipeUserDataConfirm({
  email,
  app,
  confirmMode,
  hasBranches,
  appliedIds,
  appliedBranches,
  appliedRows,
  expectedCounts,
  balanceInstitutionId,
  balanceScopeLabel,
  wipeMutation,
  onCountsChanged,
  onWiped,
}: WipeUserDataConfirmProps) {
  const { loginWithGoogleMutation } = useAuth()
  const password = useReauthPassword(email)
  const [alertOpen, setAlertOpen] = useState(false)

  const confirmTitle = app
    ? `¿Vaciar los datos de ${wipeAppCopy(app).label}?`
    : "¿Vaciar todos los datos?"

  const handleContinue = () => {
    if (appliedIds.length === 0) {
      return
    }
    password.clearPassword()
    onCountsChanged(false)
    setAlertOpen(true)
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

  const handleConfirmWipe = () => {
    if (!password.isVerified) {
      return
    }
    wipeMutation.mutate(
      {
        email,
        password: password.password,
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
          password.clearPassword()
          onCountsChanged(true)
        },
      }
    )
  }

  const handleDialogOpenChange = (next: boolean) => {
    setAlertOpen(next)
    if (!next && !wipeMutation.isPending) {
      password.clearPassword()
    }
  }

  return (
    <>
      {hasBranches ? (
        <>
          <WipeDataIrreversibleAlert />
          <WipeDataConfirmAction
            mode={confirmMode}
            hasSelection={appliedIds.length > 0}
            isGooglePending={loginWithGoogleMutation.isPending}
            isWipePending={wipeMutation.isPending}
            onGoogle={handleGoogleReauth}
            onContinue={handleContinue}
          />
        </>
      ) : null}
      <WipeDataConfirmDialog
        open={alertOpen}
        onOpenChange={handleDialogOpenChange}
        title={confirmTitle}
        appliedRows={appliedRows}
        balanceScopeLabel={balanceScopeLabel}
        email={email}
        pending={wipeMutation.isPending}
        password={password}
        onConfirm={handleConfirmWipe}
      />
    </>
  )
}
