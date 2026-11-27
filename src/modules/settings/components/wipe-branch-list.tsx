"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import type { WipeSection } from "@/src/modules/settings/lib/wipe-branches"
import { FINANCE_BALANCES_BRANCH } from "@/src/modules/settings/types/wipe.types"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { ChevronRightIcon, Landmark, ListChecks, Layers } from "lucide-react"

const WIPE_ACCENT = SETTINGS_REGISTRY.danger.accent

type WipeBranchListProps = {
  sections: WipeSection[]
  appliedIds: readonly string[]
  allSelected: boolean
  hasSelection: boolean
  disabled: boolean
  balanceScopeLabel: string
  onToggleAll: (checked: boolean) => void
  onToggleBranch: (branchId: string, checked: boolean) => void
  onPickInstitution: () => void
}

export function WipeBranchList({
  sections,
  appliedIds,
  allSelected,
  hasSelection,
  disabled,
  balanceScopeLabel,
  onToggleAll,
  onToggleBranch,
  onPickInstitution,
}: WipeBranchListProps) {
  return (
    <>
      <SummarySection title="Ramas de datos" icon={Layers}>
        <Item
          variant="plain"
          className={cn("min-h-[52px] px-3 py-3", disabled && "opacity-50")}
          aria-disabled={disabled || undefined}
        >
          <ItemMedia
            className="size-9 rounded-md"
            style={{ backgroundColor: `${WIPE_ACCENT}20` }}
          >
            <ListChecks className="size-4.5" style={{ color: WIPE_ACCENT }} />
          </ItemMedia>
          <ItemContent className="gap-0.5">
            <ItemTitle className="text-sm font-normal md:text-base">
              Seleccionar todo (excepto cuenta)
            </ItemTitle>
            <ItemDescription className="text-xs">
              Marca todas las ramas con datos.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Checkbox
              checked={allSelected}
              indeterminate={hasSelection && !allSelected}
              onCheckedChange={(value) => onToggleAll(value === true)}
              disabled={disabled}
              aria-label="Seleccionar todo (excepto cuenta)"
            />
          </ItemActions>
        </Item>
      </SummarySection>

      {sections.map((section) => (
        <SummarySection
          key={section.key}
          title={section.title}
          icon={section.icon}
        >
          {section.rows.map((row, index) => {
            const isLastRow = index === section.rows.length - 1
            const HeadingIcon = row.heading?.icon
            const headingLabel = row.heading?.label
            const RowIcon = row.icon
            const selectedBalance =
              row.branch.id === FINANCE_BALANCES_BRANCH &&
              appliedIds.includes(FINANCE_BALANCES_BRANCH)
            return (
              <div key={row.branch.id}>
                {HeadingIcon && headingLabel ? (
                  <div className="flex items-center gap-1.5 px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    <HeadingIcon className="size-3.5" aria-hidden />
                    {headingLabel}
                  </div>
                ) : null}
                <Item
                  variant="plain"
                  className={cn(
                    "min-h-[52px] px-3 py-3",
                    !(isLastRow && !selectedBalance) &&
                      "border-b border-border/60",
                    disabled && "opacity-50"
                  )}
                  aria-disabled={disabled || undefined}
                >
                  <ItemMedia
                    className="size-9 rounded-md"
                    style={{ backgroundColor: `${WIPE_ACCENT}20` }}
                  >
                    <RowIcon
                      className="size-4.5"
                      style={{ color: WIPE_ACCENT }}
                    />
                  </ItemMedia>
                  <ItemContent className="gap-0.5">
                    <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                      <ItemTitle className="text-sm font-normal md:text-base">
                        {row.label}
                      </ItemTitle>
                      <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                        {row.countLabel}
                      </ItemDescription>
                    </div>
                    <ItemDescription className="text-xs">
                      {row.draggedByLabel
                        ? `Se vacía junto con ${row.draggedByLabel}.`
                        : row.description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Checkbox
                      checked={row.checked}
                      onCheckedChange={(value) =>
                        onToggleBranch(row.branch.id, value === true)
                      }
                      disabled={disabled || row.locked || !row.selectable}
                      aria-label={row.label}
                    />
                  </ItemActions>
                </Item>
                {selectedBalance ? (
                  <Item
                    variant="plain"
                    className={cn(
                      "min-h-[52px] px-3 py-3",
                      !isLastRow && "border-b border-border/60",
                      disabled && "opacity-50"
                    )}
                    aria-disabled={disabled || undefined}
                    render={
                      <button type="button" onClick={onPickInstitution} />
                    }
                  >
                    <ItemMedia
                      className="size-9 rounded-md"
                      style={{ backgroundColor: `${WIPE_ACCENT}20` }}
                    >
                      <Landmark
                        className="size-4.5"
                        style={{ color: WIPE_ACCENT }}
                      />
                    </ItemMedia>
                    <ItemContent className="gap-0.5">
                      <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                        <ItemTitle className="text-sm font-normal md:text-base">
                          Institución
                        </ItemTitle>
                        <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                          {balanceScopeLabel}
                        </ItemDescription>
                      </div>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRightIcon className="size-4.5 text-muted-foreground" />
                    </ItemActions>
                  </Item>
                ) : null}
              </div>
            )
          })}
        </SummarySection>
      ))}
    </>
  )
}
