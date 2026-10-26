import type { LucideIcon } from "lucide-react"

import {
  FINANCE_BRANCH_THEMES,
  OTHER_FINANCE_THEME_ITEM,
  WIPE_BRANCH_TEXTS,
  financeBranchThemeOf,
  wipeAppCopy,
  wipeBranchCopy,
  type FinanceBranchTheme,
} from "@/src/modules/settings/lib/wipe-branch-texts"
import {
  DATA_APP,
  type DataAppBranches,
  type DataBranch,
} from "@/src/modules/settings/types/wipe.types"

export type WipeRowHeading = {
  label: string
  icon: LucideIcon
}

export type WipeRow = {
  branch: DataBranch
  label: string
  description?: string
  icon: LucideIcon
  checked: boolean
  locked: boolean
  selectable: boolean
  draggedByLabel?: string
  countLabel: string
  heading?: WipeRowHeading
}

export type WipeSection = {
  key: string
  title: string
  icon: LucideIcon
  rows: WipeRow[]
}

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

type FormatBranchCountInput = {
  branchId: string
  count: number
  locale: string
}

export function formatBranchCount({
  branchId,
  count,
  locale,
}: FormatBranchCountInput): string {
  if (count <= 0) {
    return "Sin datos"
  }
  const unit = WIPE_BRANCH_TEXTS[branchId]?.unit
  const amount = new Intl.NumberFormat(locale).format(count)
  if (!unit) {
    return `${amount} filas`
  }
  return `${amount} ${count === 1 ? unit.singular : unit.plural}`
}

type BuildSectionsInput = {
  groups: readonly DataAppBranches[]
  selected: readonly string[]
  locale: string
  app?: string
}

type SectionContext = {
  branches: readonly DataBranch[]
  selected: readonly string[]
  parents: ReadonlyMap<string, string>
  locale: string
}

export function buildWipeSections({
  groups,
  selected,
  locale,
  app,
}: BuildSectionsInput): WipeSection[] {
  const visibleGroups = groups.filter((group) => !app || group.app === app)
  const branches = visibleGroups.flatMap((group) => group.branches)
  const context: SectionContext = {
    branches,
    selected,
    parents: draggedBranchParents({ branches, selected }),
    locale,
  }

  if (app === DATA_APP.FINANCE) {
    return financeThemeSections(context, branches)
  }
  return visibleGroups.map((group) => appSection(context, group))
}

function appSection(
  context: SectionContext,
  group: DataAppBranches
): WipeSection {
  const appCopy = wipeAppCopy(group.app)
  return {
    key: group.app,
    title: appCopy.label,
    icon: appCopy.icon,
    rows:
      group.app === DATA_APP.FINANCE
        ? financeThemeRows(context, group.branches, true)
        : group.branches.map((branch) => branchRow(context, branch)),
  }
}

function financeThemeSections(
  context: SectionContext,
  branches: readonly DataBranch[]
): WipeSection[] {
  return orderedFinanceThemes(branches).map((theme) => ({
    key: theme.id,
    title: theme.label,
    icon: theme.icon,
    rows: theme.branches.map((branch) => branchRow(context, branch)),
  }))
}

function financeThemeRows(
  context: SectionContext,
  branches: readonly DataBranch[],
  withHeadings: boolean
): WipeRow[] {
  return orderedFinanceThemes(branches).flatMap((theme) =>
    theme.branches.map((branch, index) =>
      branchRow(
        context,
        branch,
        withHeadings && index === 0
          ? { label: theme.label, icon: theme.icon }
          : undefined
      )
    )
  )
}

type FinanceThemeGroup = FinanceBranchTheme & { branches: DataBranch[] }

function orderedFinanceThemes(
  branches: readonly DataBranch[]
): FinanceThemeGroup[] {
  const themed = new Map<string, DataBranch[]>()
  for (const branch of branches) {
    const theme = financeBranchThemeOf(branch.id)
    themed.set(theme.id, [...(themed.get(theme.id) ?? []), branch])
  }
  const themes = [...FINANCE_BRANCH_THEMES, OTHER_FINANCE_THEME_ITEM]
  return themes.flatMap((theme) => {
    const themeBranches = themed.get(theme.id)
    return themeBranches ? [{ ...theme, branches: themeBranches }] : []
  })
}

function branchRow(
  context: SectionContext,
  branch: DataBranch,
  heading?: WipeRowHeading
): WipeRow {
  const copy = wipeBranchCopy(branch)
  const draggedBy = context.parents.get(branch.id)
  const draggedByBranch = draggedBy
    ? context.branches.find((candidate) => candidate.id === draggedBy)
    : undefined
  const draggedByLabel = draggedByBranch
    ? wipeBranchCopy(draggedByBranch).label
    : undefined

  return {
    branch,
    label: copy.label,
    ...(copy.description ? { description: copy.description } : {}),
    icon: copy.icon,
    checked: context.selected.includes(branch.id) || draggedBy !== undefined,
    locked: draggedBy !== undefined,
    selectable: branch.count > 0,
    ...(draggedByLabel ? { draggedByLabel } : {}),
    countLabel: formatBranchCount({
      branchId: branch.id,
      count: branch.count,
      locale: context.locale,
    }),
    ...(heading ? { heading } : {}),
  }
}
