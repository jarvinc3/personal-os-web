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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Trash2Icon, XIcon } from "lucide-react"
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
    <AlertDialog
      open={confirmOpen}
      onOpenChange={(open) => {
        if (!open && !wipeAfterReauth.isPending) {
          handleCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Vaciar los datos seleccionados?</AlertDialogTitle>
          <AlertDialogDescription>
            Confirmaste tu identidad con Google. Esto no se puede deshacer. Se
            vaciarán:
          </AlertDialogDescription>
        </AlertDialogHeader>
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={wipeAfterReauth.isPending}>
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={wipeAfterReauth.isPending}
            onClick={handleConfirm}
          >
            {wipeAfterReauth.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
            )}
            {wipeAfterReauth.isPending ? "Vaciando..." : "Vaciar datos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
