"use client"

import { CategorySheet } from "@/src/modules/finance/components/catalog/category-sheet";
import { useCategories } from "@/src/modules/finance/hooks/use-categories";
import {
  type CategoryGroup,
  groupCategoriesByParent,
  isFinanceCategoryEditable,
} from "@/src/modules/finance/lib/category-tree";
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error";
import type { FinanceCategory } from "@/src/modules/finance/types/entities";
import { SettingsRow } from "@/src/shared/components/layout/settings-section";
import { Button } from "@/src/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { ChevronDownIcon, PlusIcon, TagsIcon } from "lucide-react";
import { useMemo, useState } from "react";

type CategoriesSectionProps = {
  enabled: boolean
  /** When true, tapping a category opens the edit sheet. */
  editable?: boolean
  /** Hide the SummarySection chrome (title/actions) for dedicated pages. */
  bare?: boolean
}

function categoryLabel(category: FinanceCategory) {
  return `${category.icon ? `${category.icon} ` : ""}${category.name}`
}

function categoryValue(category: FinanceCategory) {
  return category.isSystem ? "Sistema" : "Custom"
}

function CategoryRow({
  category,
  isLast,
  onEdit,
}: {
  category: FinanceCategory
  isLast?: boolean
  onEdit?: (category: FinanceCategory) => void
}) {
  const canEdit = onEdit && isFinanceCategoryEditable(category)
  return (
    <SettingsRow
      label={categoryLabel(category)}
      value={categoryValue(category)}
      accentColor={category.color ?? undefined}
      icon={TagsIcon}
      isLast={isLast}
      onPress={canEdit ? () => onEdit?.(category) : undefined}
      showChevron={Boolean(canEdit)}
    />
  )
}

function CategoryGroupBlock({
  group,
  onEdit,
}: {
  group: CategoryGroup<FinanceCategory>
  onEdit?: (category: FinanceCategory) => void
}) {
  const { category, children } = group
  const canEditParent = onEdit && isFinanceCategoryEditable(category)

  if (children.length === 0) {
    return <CategoryRow category={category} isLast onEdit={onEdit} />
  }

  return (
    <Collapsible className="group/category">
      <div className="flex items-stretch border-b border-border/60 last:border-b-0">
        <div className="min-w-0 flex-1">
          <SettingsRow
            label={categoryLabel(category)}
            value={categoryValue(category)}
            accentColor={category.color ?? undefined}
            icon={TagsIcon}
            isLast
            onPress={canEditParent ? () => onEdit?.(category) : undefined}
            showChevron={false}
          />
        </div>
        <CollapsibleTrigger
          type="button"
          className="flex shrink-0 items-center px-3 text-muted-foreground hover:bg-muted/50"
          aria-label={`Expandir ${category.name}`}
        >
          <ChevronDownIcon className="size-4.5 transition-transform group-data-open/category:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="flex flex-col pl-7">
          {children.map((child, index) => (
            <CategoryRow
              key={child.id}
              category={child}
              isLast={index === children.length - 1}
              onEdit={onEdit}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FinanceCategoriesSection({
  enabled,
  editable = false,
  bare = false,
}: CategoriesSectionProps) {
  const categoriesQuery = useCategories(enabled)
  const categories = categoriesQuery.data ?? []
  const groups = useMemo(
    () => groupCategoriesByParent(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )
  const [editing, setEditing] = useState<FinanceCategory | null | undefined>(
    undefined,
  )
  const sheetOpen = editing !== undefined

  const errorMessage = categoriesQuery.error
    ? financeErrorMessage(categoriesQuery.error)
    : null

  const createButton = (
    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
      <PlusIcon />
      Crear categoría
    </Button>
  )

  const body = (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {categoriesQuery.isPending ? (
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      ) : groups.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          No hay categorías. Crea una con un emoji.
        </p>
      ) : (
        groups.map((group) => (
          <CategoryGroupBlock
            key={group.category.id}
            group={group}
            onEdit={editable ? (category) => setEditing(category) : undefined}
          />
        ))
      )}
    </>
  )

  return (
    <>
      {bare ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end">{createButton}</div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {body}
          </div>
        </div>
      ) : (
        <SummarySection title="Categorías" icon={TagsIcon} right={createButton}>
          {body}
          </SummarySection>
      )}

      <CategorySheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
        category={editing ?? null}
        categories={categories}
      />
    </>
  )
}
