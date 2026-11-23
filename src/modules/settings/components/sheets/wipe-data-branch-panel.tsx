"use client"

import { WipeBranchList } from "@/src/modules/settings/components/wipe-branch-list"
import type { DataBranchesQuery } from "@/src/modules/settings/hooks/use-data-branches"
import type { WipeSection } from "@/src/modules/settings/lib/wipe-branches"
import type { DataBranch } from "@/src/modules/settings/types/wipe.types"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Eraser } from "lucide-react"

type WipeDataBranchPanelProps = {
  dataBranches: DataBranchesQuery
  branches: DataBranch[]
  sections: WipeSection[]
  appliedIds: readonly string[]
  allSelected: boolean
  hasSelection: boolean
  disabled: boolean
  balanceScopeLabel: string
  app?: string
  onToggleAll: (checked: boolean) => void
  onToggleBranch: (branchId: string, checked: boolean) => void
  onPickInstitution: () => void
}

export function WipeDataBranchPanel({
  dataBranches,
  branches,
  sections,
  appliedIds,
  allSelected,
  hasSelection,
  disabled,
  balanceScopeLabel,
  app,
  onToggleAll,
  onToggleBranch,
  onPickInstitution,
}: WipeDataBranchPanelProps) {
  if (dataBranches.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (dataBranches.isError) {
    return (
      <ErrorState
        message="No se pudieron cargar las ramas de datos."
        onRetry={() => void dataBranches.refetch()}
        isRetrying={dataBranches.isFetching}
      />
    )
  }

  if (branches.length === 0) {
    return (
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
    )
  }

  return (
    <WipeBranchList
      sections={sections}
      appliedIds={appliedIds}
      allSelected={allSelected}
      hasSelection={hasSelection}
      disabled={disabled}
      balanceScopeLabel={balanceScopeLabel}
      onToggleAll={onToggleAll}
      onToggleBranch={onToggleBranch}
      onPickInstitution={onPickInstitution}
    />
  )
}
