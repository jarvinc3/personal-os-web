"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { formatBranchCount } from "@/src/modules/settings/lib/wipe-branches"
import {
  clearPendingDataWipe,
  readPendingDataWipe,
  type PendingDataWipe,
} from "@/src/modules/settings/lib/pending-data-wipe"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"

function expectedCounts(pendingWipe: PendingDataWipe): Record<string, number> {
  return Object.fromEntries(
    pendingWipe.branches.map((branch) => [branch.id, branch.count])
  )
}

export function PendingDataWipeHandler() {
  const { isAuthenticated } = useAuthGuard()
  const { wipeAfterReauth } = useWipeUserData()
  const formatLocale = useFormatLocale()
  const [dismissed, setDismissed] = useState(false)
  const [pendingWipe] = useState(() => readPendingDataWipe())

  const confirmOpen = isAuthenticated && pendingWipe !== null && !dismissed

  const handleCancel = () => {
    clearPendingDataWipe()
    setDismissed(true)
  }

  const handleConfirm = () => {
    if (!pendingWipe) {
      return
    }
    clearPendingDataWipe()
    wipeAfterReauth.mutate(
      {
        branches: pendingWipe.branches.map((branch) => branch.id),
        expectedCounts: expectedCounts(pendingWipe),
        ...(pendingWipe.balanceInstitutionId
          ? { balanceInstitutionId: pendingWipe.balanceInstitutionId }
          : {}),
        branchLabels: Object.fromEntries(
          pendingWipe.branches.map((branch) => [branch.id, branch.label])
        ),
      },
      { onSettled: () => setDismissed(true) }
    )
  }

  return (
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={(open) => !open && handleCancel()}
      tone="danger"
      icon={Trash2Icon}
      title="¿Vaciar los datos seleccionados?"
      description="Confirmaste tu identidad con Google. Esto no se puede deshacer. Se vaciarán:"
      confirmLabel="Vaciar datos"
      confirmIcon={Trash2Icon}
      pending={wipeAfterReauth.isPending}
      pendingLabel="Vaciando..."
      onConfirm={handleConfirm}
    >
      <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
        {pendingWipe?.branches.map((branch) => (
          <li key={branch.id} className="text-sm text-muted-foreground">
            • {branch.label} ·{" "}
            {formatBranchCount({
              branchId: branch.id,
              count: branch.count,
              locale: formatLocale,
            })}
          </li>
        ))}
      </ul>
    </ConfirmDialog>
  )
}
