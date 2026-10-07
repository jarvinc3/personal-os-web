"use client"

import { CategoryCard } from "@/src/modules/finance/components/catalog/category-card"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import {
  filterCategoriesByType,
  groupCategoriesByParent,
  sortCategoriesNewestFirst,
} from "@/src/modules/finance/lib/category-tree"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, TagsIcon } from "lucide-react"
import { useMemo } from "react"

type CategoryPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: FinanceCategory[]
  categoryType: FinanceCategoryType
  onSelect: (categoryId: string) => void
}

export function CategoryPickerSheet({
  open,
  onOpenChange,
  categories,
  categoryType,
  onSelect,
}: CategoryPickerSheetProps) {
  const groups = useMemo(
    () =>
      groupCategoriesByParent(
        sortCategoriesNewestFirst(
          filterCategoriesByType(categories, categoryType),
        ),
      ),
    [categories, categoryType],
  )

  function select(categoryId: string) {
    onSelect(categoryId)
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Categoría"
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
          PRESSABLE_CLASS,
        )}
        onClick={() => select(CATALOG_NONE)}
      >
        <TagsIcon className="size-5 text-muted-foreground" />
        <span className="text-sm font-medium">Sin categoría</span>
      </button>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay categorías de este tipo.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => {
            const parent = group.category
            if (group.children.length === 0) {
              return (
                <CategoryCard
                  key={parent.id}
                  name={parent.name}
                  icon={parent.icon}
                  color={parent.color}
                  isSystem={parent.isSystem}
                  onPress={() => select(parent.id)}
                />
              )
            }
            return (
              <Collapsible key={parent.id} className="group/category">
                <CategoryCard
                  name={parent.name}
                  icon={parent.icon}
                  color={parent.color}
                  isSystem={parent.isSystem}
                  onPress={() => select(parent.id)}
                  trailing={
                    <CollapsibleTrigger
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center text-muted-foreground"
                      aria-label={`Expandir ${parent.name}`}
                    >
                      <ChevronDownIcon className="size-4 transition-transform group-data-open/category:rotate-180" />
                    </CollapsibleTrigger>
                  }
                />
                <CollapsibleContent className="mt-2 flex flex-col gap-2 pl-7">
                  {group.children.map((child) => (
                    <CategoryCard
                      key={child.id}
                      name={child.name}
                      icon={child.icon}
                      color={child.color ?? parent.color}
                      isSystem={child.isSystem}
                      onPress={() => select(child.id)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
