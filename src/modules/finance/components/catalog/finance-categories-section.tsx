"use client"

import { CategorySheet } from "@/src/modules/finance/components/catalog/category-sheet"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import {
  type CategoryGroup,
  groupCategoriesByParent,
} from "@/src/modules/finance/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceCategory } from "@/src/modules/finance/types/entities"
import { SettingsRow } from "@/src/shared/components/layout/settings-section"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { ChevronDownIcon, PlusIcon, TagsIcon } from "lucide-react"
import { useMemo, useState } from "react"

type CategoriesSectionProps = {
  enabled: boolean
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
}: {
  category: FinanceCategory
  isLast?: boolean
}) {
  return (
    <SettingsRow
      label={categoryLabel(category)}
      value={categoryValue(category)}
      accentColor={category.color ?? undefined}
      icon={TagsIcon}
      isLast={isLast}
    />
  )
}

function CategoryGroupBlock({
  group,
}: {
  group: CategoryGroup<FinanceCategory>
}) {
  const { category, children } = group

  if (children.length === 0) {
    return <CategoryRow category={category} isLast />
  }

  return (
    <Collapsible className="group/category">
      <CollapsibleTrigger className="w-full cursor-pointer rounded-xl text-left hover:bg-muted/50">
        <SettingsRow
          label={categoryLabel(category)}
          value={categoryValue(category)}
          accentColor={category.color ?? undefined}
          icon={TagsIcon}
          trailing={
            <ChevronDownIcon className="size-[18px] text-muted-foreground transition-transform group-data-open/category:rotate-180" />
          }
          isLast
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col pl-7">
          {children.map((child, index) => (
            <CategoryRow
              key={child.id}
              category={child}
              isLast={index === children.length - 1}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FinanceCategoriesSection({ enabled }: CategoriesSectionProps) {
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

  return (
    <>
      <SummarySection
        title="Categorías"
        icon={TagsIcon}
        right={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(null)}
          >
            <PlusIcon />
            Crear categoría
          </Button>
        }
      >
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
            <CategoryGroupBlock key={group.category.id} group={group} />
          ))
        )}
      </SummarySection>

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
