import type {
  DataAppBranches,
  DataBranch,
} from "@/src/modules/settings/types/wipe.types"

type BranchSelectionInput = {
  branches: readonly DataBranch[]
  selected: readonly string[]
}

export function branchesOf(
  groups: readonly DataAppBranches[],
  app?: string
): DataBranch[] {
  return groups
    .filter((group) => !app || group.app === app)
    .flatMap((group) => group.branches)
}

export function findAppBranches(
  groups: readonly DataAppBranches[] | undefined,
  app: string
): DataBranch[] {
  return groups?.find((group) => group.app === app)?.branches ?? []
}

/** Selected branches plus everything they drag, in the API display order. */
export function expandWipeSelection({
  branches,
  selected,
}: BranchSelectionInput): string[] {
  const byId = new Map(branches.map((branch) => [branch.id, branch]))
  const included = new Set(selected)
  const pending = [...selected]

  while (pending.length > 0) {
    const currentId = pending.pop()
    if (currentId === undefined) {
      continue
    }
    const branch = byId.get(currentId)
    if (!branch) {
      continue
    }
    for (const include of branch.includes) {
      if (included.has(include.id)) {
        continue
      }
      included.add(include.id)
      pending.push(include.id)
    }
  }

  return branches
    .filter((branch) => included.has(branch.id))
    .map((branch) => branch.id)
}

type ToggleBranchInput = BranchSelectionInput & {
  branchId: string
  checked: boolean
}

/**
 * Checking adds the branch; unchecking removes it and every selected branch
 * that needs it. Dependencies come from the API, never from the client.
 */
export function toggleBranchSelection({
  branches,
  selected,
  branchId,
  checked,
}: ToggleBranchInput): string[] {
  const next = new Set(selected)

  if (checked) {
    next.add(branchId)
    return branches
      .filter((branch) => next.has(branch.id))
      .map((branch) => branch.id)
  }

  const removed = new Set([branchId])
  for (const id of selected) {
    if (id === branchId) {
      continue
    }
    const dragged = expandWipeSelection({ branches, selected: [id] })
    if (dragged.includes(branchId)) {
      removed.add(id)
    }
  }

  return branches
    .filter((branch) => next.has(branch.id) && !removed.has(branch.id))
    .map((branch) => branch.id)
}

export function selectableBranchIds(branches: readonly DataBranch[]): string[] {
  return branches
    .filter((branch) => branch.count > 0)
    .map((branch) => branch.id)
}

type ToggleAllInput = BranchSelectionInput & { checked: boolean }

export function toggleAllBranchSelection({
  branches,
  selected,
  checked,
}: ToggleAllInput): string[] {
  if (!checked) {
    return []
  }
  const next = new Set([...selected, ...selectableBranchIds(branches)])
  return branches
    .filter((branch) => next.has(branch.id))
    .map((branch) => branch.id)
}

export function allSelectableBranchesSelected({
  branches,
  selected,
}: BranchSelectionInput): boolean {
  const selectable = selectableBranchIds(branches)
  return (
    selectable.length > 0 &&
    selectable.every((branchId) => selected.includes(branchId))
  )
}

export type ResolvedWipeSelection = {
  selectedIds: string[]
  appliedIds: string[]
  appliedBranches: DataBranch[]
  expectedCounts: Record<string, number>
}

/**
 * What the user picked, once zero-count rows are dropped and each branch drags
 * the ones the API says it needs. The view reads this contract, not the steps.
 */
export function resolveWipeSelection({
  branches,
  selected,
}: BranchSelectionInput): ResolvedWipeSelection {
  const branchById = new Map(branches.map((branch) => [branch.id, branch]))
  const selectedIds = selected.filter(
    (branchId) => (branchById.get(branchId)?.count ?? 0) > 0
  )
  const appliedIds = expandWipeSelection({ branches, selected: selectedIds })

  return {
    selectedIds,
    appliedIds,
    appliedBranches: appliedIds.flatMap((branchId) => {
      const branch = branchById.get(branchId)
      return branch ? [branch] : []
    }),
    expectedCounts: expectedBranchCounts({ branches, selected: appliedIds }),
  }
}

/** Counts the user saw, for the branches that will run. */
export function expectedBranchCounts({
  branches,
  selected,
}: BranchSelectionInput): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const branch of branches) {
    if (selected.includes(branch.id)) {
      counts[branch.id] = branch.count
    }
  }
  return counts
}

/** Selected branch that drags each locked row, in display order. */
export function draggedBranchParents({
  branches,
  selected,
}: BranchSelectionInput): Map<string, string> {
  const parents = new Map<string, string>()
  for (const id of selected) {
    for (const dragged of expandWipeSelection({ branches, selected: [id] })) {
      if (
        dragged === id ||
        selected.includes(dragged) ||
        parents.has(dragged)
      ) {
        continue
      }
      parents.set(dragged, id)
    }
  }
  return parents
}
