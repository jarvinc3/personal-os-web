"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  filterCategoriesByType,
  groupCategoriesByParent,
  searchCategoryGroups,
  sortCategoriesNewestFirst,
} from "@/src/modules/finance/shared/lib/category-tree"
import { foldSearchText } from "@/src/modules/finance/shared/lib/search-text"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, SearchIcon, TagsIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const NONE_LABEL = "Sin categoría"

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
  const [search, setSearch] = useState("")
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({})
  const groups = useMemo(
    () =>
      groupCategoriesByParent(
        sortCategoriesNewestFirst(
          filterCategoriesByType(categories, categoryType)
        )
      ),
    [categories, categoryType]
  )
  const hits = useMemo(
    () => searchCategoryGroups(groups, search),
    [groups, search]
  )
  const searching = foldSearchText(search).length > 0
  const showNone =
    !searching || foldSearchText(NONE_LABEL).includes(foldSearchText(search))

  useEffect(() => {
    if (!open) {
      // A picker can be replaced by another sheet without a close callback,
      // so reset on the open flag instead of the close handler.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("")
      setManualOpen({})
    }
  }, [open])

  function select(categoryId: string) {
    onSelect(categoryId)
    onOpenChange(false)
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Categoría">
      <div className="sticky -top-5 z-10 bg-background pt-3 pb-1">
        <FormTextField
          icon={SearchIcon}
          type="search"
          value={search}
          onChange={setSearch}
          placeholder="Buscar categoría"
          ariaLabel="Buscar categoría"
          autoComplete="off"
          className="min-h-10"
        />
      </div>

      {showNone ? (
        <button
          key={search}
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
            PRESSABLE_CLASS,
            searching && "animate-search-flash"
          )}
          onClick={() => select(CATALOG_NONE)}
        >
          <TagsIcon className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">{NONE_LABEL}</span>
        </button>
      ) : null}

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay categorías de este tipo.
        </p>
      ) : hits.length === 0 && !showNone ? (
        <p className="text-sm text-muted-foreground">
          Ninguna categoría coincide.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {hits.map((hit) => {
            const parent = hit.category
            const flash = hit.parentMatches ? "animate-search-flash" : undefined
            if (hit.children.length === 0) {
              return (
                <CategoryCard
                  key={`${parent.id}:${search}`}
                  name={parent.name}
                  icon={parent.icon}
                  color={parent.color}
                  isSystem={parent.isSystem}
                  onPress={() => select(parent.id)}
                  className={flash}
                />
              )
            }
            const open = searching
              ? hit.open || Boolean(manualOpen[parent.id])
              : Boolean(manualOpen[parent.id])
            return (
              <Collapsible
                key={parent.id}
                className="group/category"
                open={open}
                onOpenChange={(next) =>
                  setManualOpen((current) => ({
                    ...current,
                    [parent.id]: next,
                  }))
                }
              >
                <CategoryCard
                  key={`${parent.id}:${search}`}
                  name={parent.name}
                  icon={parent.icon}
                  color={parent.color}
                  isSystem={parent.isSystem}
                  onPress={() => select(parent.id)}
                  className={flash}
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
                  {hit.children.map((child) => {
                    const childHit = hit.matchingChildren.some(
                      (match) => match.id === child.id
                    )
                    return (
                      <CategoryCard
                        key={`${child.id}:${search}`}
                        name={child.name}
                        icon={child.icon}
                        color={child.color ?? parent.color}
                        isSystem={child.isSystem}
                        onPress={() => select(child.id)}
                        className={
                          childHit ? "animate-search-flash" : undefined
                        }
                      />
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
