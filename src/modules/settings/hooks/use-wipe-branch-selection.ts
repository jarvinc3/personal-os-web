"use client"

import { useDataBranches } from "@/src/modules/settings/hooks/use-data-branches"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import {
  allSelectableBranchesSelected,
  branchesOf,
  buildWipeSections,
  expandWipeSelection,
  resolveWipeSelection,
  toggleAllBranchSelection,
  toggleBranchSelection,
  type WipeRow,
  type WipeSection,
} from "@/src/modules/settings/lib/wipe-branches"
import {
  FINANCE_BALANCES_BRANCH,
  type DataBranch,
} from "@/src/modules/settings/types/wipe.types"
import { useState } from "react"

type UseWipeBranchSelectionInput = {
  app?: string
  onBalancesDeselected: () => void
  onSelectionChanged: () => void
}

export type WipeBranchSelection = {
  dataBranches: ReturnType<typeof useDataBranches>
  branches: DataBranch[]
  sections: WipeSection[]
  appliedRows: WipeRow[]
  selectedIds: string[]
  appliedIds: string[]
  appliedBranches: DataBranch[]
  expectedCounts: Record<string, number>
  hasSelection: boolean
  allSelected: boolean
  balancesApplied: boolean
  toggleAll: (checked: boolean) => void
  toggleBranch: (branchId: string, checked: boolean) => void
}

/** Branch selection and its derived wipe rows; the query stays with it. */
export function useWipeBranchSelection({
  app,
  onBalancesDeselected,
  onSelectionChanged,
}: UseWipeBranchSelectionInput): WipeBranchSelection {
  const dataBranches = useDataBranches()
  const formatLocale = useFormatLocale()
  const [selected, setSelected] = useState<string[]>([])

  const groups = dataBranches.data ?? []
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

  const applySelection = (next: string[]) => {
    setSelected(next)
    onSelectionChanged()
    const stillWipesBalances = expandWipeSelection({
      branches,
      selected: next,
    }).includes(FINANCE_BALANCES_BRANCH)
    if (!stillWipesBalances) {
      onBalancesDeselected()
    }
  }

  const toggleBranch = (branchId: string, checked: boolean) => {
    applySelection(
      toggleBranchSelection({
        branches,
        selected: selectedIds,
        branchId,
        checked,
      })
    )
  }

  const toggleAll = (checked: boolean) => {
    applySelection(
      toggleAllBranchSelection({ branches, selected: selectedIds, checked })
    )
  }

  return {
    dataBranches,
    branches,
    sections,
    appliedRows,
    selectedIds,
    appliedIds,
    appliedBranches,
    expectedCounts,
    hasSelection,
    allSelected,
    balancesApplied,
    toggleAll,
    toggleBranch,
  }
}
