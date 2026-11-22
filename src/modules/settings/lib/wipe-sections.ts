import type { LucideIcon } from "lucide-react"

import { formatBranchCount } from "@/src/modules/settings/lib/wipe-branch-counts"
import { draggedBranchParents } from "@/src/modules/settings/lib/wipe-branch-selection"
import {
  FINANCE_BRANCH_THEMES,
  OTHER_FINANCE_THEME_ITEM,
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

type BuildSectionsInput = {
  groups: readonly DataAppBranches[]
  selected: readonly string[]
  locale: string
  app?: string
}

type WipeRowContext = {
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
  const rowContext: WipeRowContext = {
    branches,
    selected,
    parents: draggedBranchParents({ branches, selected }),
    locale,
  }

  if (app === DATA_APP.FINANCE) {
    return financeThemeSections(rowContext, branches)
  }
  return visibleGroups.map((group) => appSection(rowContext, group))
}

function appSection(
  rowContext: WipeRowContext,
  group: DataAppBranches
): WipeSection {
  const appCopy = wipeAppCopy(group.app)
  return {
    key: group.app,
    title: appCopy.label,
    icon: appCopy.icon,
    rows:
      group.app === DATA_APP.FINANCE
        ? financeRowsWithThemeHeadings(rowContext, group.branches)
        : group.branches.map((branch) => branchRow({ rowContext, branch })),
  }
}

function financeThemeSections(
  rowContext: WipeRowContext,
  branches: readonly DataBranch[]
): WipeSection[] {
  return orderedFinanceThemes(branches).map((theme) => ({
    key: theme.id,
    title: theme.label,
    icon: theme.icon,
    rows: theme.branches.map((branch) => branchRow({ rowContext, branch })),
  }))
}

function financeRowsWithThemeHeadings(
  rowContext: WipeRowContext,
  branches: readonly DataBranch[]
): WipeRow[] {
  return orderedFinanceThemes(branches).flatMap((theme) =>
    theme.branches.map((branch, index) =>
      branchRow({
        rowContext,
        branch,
        ...(index === 0
          ? { heading: { label: theme.label, icon: theme.icon } }
          : {}),
      })
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

type BranchRowInput = {
  rowContext: WipeRowContext
  branch: DataBranch
  heading?: WipeRowHeading
}

function branchRow({ rowContext, branch, heading }: BranchRowInput): WipeRow {
  const branchCopy = wipeBranchCopy(branch)
  const draggedBy = rowContext.parents.get(branch.id)
  const draggedByBranch = draggedBy
    ? rowContext.branches.find((candidate) => candidate.id === draggedBy)
    : undefined
  const draggedByLabel = draggedByBranch
    ? wipeBranchCopy(draggedByBranch).label
    : undefined

  return {
    branch,
    label: branchCopy.label,
    ...(branchCopy.description ? { description: branchCopy.description } : {}),
    icon: branchCopy.icon,
    checked: rowContext.selected.includes(branch.id) || draggedBy !== undefined,
    locked: draggedBy !== undefined,
    selectable: branch.count > 0,
    ...(draggedByLabel ? { draggedByLabel } : {}),
    countLabel: formatBranchCount({
      branchId: branch.id,
      count: branch.count,
      locale: rowContext.locale,
    }),
    ...(heading ? { heading } : {}),
  }
}
