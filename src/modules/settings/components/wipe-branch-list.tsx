"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import type { WipeSection } from "@/src/modules/settings/lib/wipe-branches"
import { FINANCE_BALANCES_BRANCH } from "@/src/modules/settings/types/wipe.types"
import { SettingsRow } from "@/src/shared/components/settings/settings-section"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import { Landmark, ListChecks, Layers } from "lucide-react"

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
        <SettingsRow
          label="Seleccionar todo (excepto cuenta)"
          description="Marca todas las ramas con datos."
          icon={ListChecks}
          accentColor={WIPE_ACCENT}
          trailing={
            <Checkbox
              checked={allSelected}
              indeterminate={hasSelection && !allSelected}
              onCheckedChange={(value) => onToggleAll(value === true)}
              disabled={disabled}
              aria-label="Seleccionar todo (excepto cuenta)"
            />
          }
          disabled={disabled}
          isLast
        />
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
                <SettingsRow
                  label={row.label}
                  description={
                    row.draggedByLabel
                      ? `Se vacía junto con ${row.draggedByLabel}.`
                      : row.description
                  }
                  value={row.countLabel}
                  icon={row.icon}
                  accentColor={WIPE_ACCENT}
                  trailing={
                    <Checkbox
                      checked={row.checked}
                      onCheckedChange={(value) =>
                        onToggleBranch(row.branch.id, value === true)
                      }
                      disabled={disabled || row.locked || !row.selectable}
                      aria-label={row.label}
                    />
                  }
                  disabled={disabled}
                  isLast={isLastRow && !selectedBalance}
                />
                {selectedBalance ? (
                  <SettingsRow
                    label="Institución"
                    value={balanceScopeLabel}
                    icon={Landmark}
                    accentColor={WIPE_ACCENT}
                    onPress={onPickInstitution}
                    disabled={disabled}
                    isLast={isLastRow}
                  />
                ) : null}
              </div>
            )
          })}
        </SummarySection>
      ))}
    </>
  )
}
